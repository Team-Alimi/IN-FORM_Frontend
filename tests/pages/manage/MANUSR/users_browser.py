"""Vite :5173 + Python Playwright. All user APIs are mocked; no real role changes."""
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests, errors, held = [], [], []
mode = 'normal'
names = ['홍길동', '김운영', '이철수', '박지수', '최민호', '윤소라', '강민준', '임서연']
emails = ['hong@inha.edu', 'admin_kim@inha.edu', 'lee_withdraw@inha.edu', 'park.jisu@inha.edu', 'choi.minho@inha.edu', 'yoon.sora@inha.edu', 'kang.admin@inha.edu', 'lim.withdraw@inha.edu']
rows = [dict(id=i+1, name=names[i % 8], email=emails[i] if i < 8 else f'member{i+1}@inha.edu', role='ADMIN' if i in [1,6] else 'USER', status='WITHDRAWN' if i in [2,6,7] else 'ACTIVE', onboarding_completed=i != 7, created_at='2026-03-02T05:22:01Z') for i in range(17)]
for row in rows:
    if row['status'] == 'WITHDRAWN': row['withdrawn_at'] = '2026-07-30T09:02:00Z'
rows[7].pop('name')

def respond_error(route, status, code, message):
    route.fulfill(status=status, json=dict(success=False, error=dict(code=code, message=message)))

def route_api(route):
    global mode
    req = route.request
    path = urlparse(req.url).path
    query = parse_qs(urlparse(req.url).query)
    body = req.post_data_json if req.method == 'PATCH' else None
    requests.append((req.method, path, query, body))
    assert path.startswith('/api/v1/admin/users'), path
    if mode == 'forbidden':
        respond_error(route, 403, 'FORBIDDEN', '권한이 없습니다.'); return
    if path == '/api/v1/admin/users':
        assert req.method == 'GET' and query['size'] == ['8'] and 'sort' not in query
        if mode == 'list-error':
            respond_error(route, 500, 'INTERNAL_SERVER_ERROR', '서버 오류'); return
        filtered = rows[:]
        if query.get('keyword'):
            keyword = query['keyword'][0].lower()
            assert len(keyword) >= 2
            filtered = [r for r in filtered if keyword in r['email'].lower() or keyword in r.get('name', '').lower()]
        for field in ['role', 'status']:
            if query.get(field): filtered = [r for r in filtered if r[field] == query[field][0]]
        number = int(query['page'][0]); total = len(filtered)
        data = dict(content=filtered[(number-1)*8:number*8], page_info=dict(current_page=number, size=8, total_items=total, total_pages=(total+7)//8, has_next=number*8<total))
    else:
        user_id = int(path.split('/')[5])
        user = next((r for r in rows if r['id'] == user_id), None)
        if mode == 'detail-404' or not user:
            respond_error(route, 404, 'USER_NOT_FOUND', '존재하지 않는 사용자입니다.'); return
        if req.method == 'GET':
            if mode == 'detail-hold': held.append(route); return
            if mode == 'detail-forbidden': respond_error(route, 403, 'FORBIDDEN', '권한이 없습니다.'); return
            if mode == 'detail-error': respond_error(route, 500, 'INTERNAL_SERVER_ERROR', '서버 오류'); return
            data = user
        else:
            assert req.method == 'PATCH' and path.endswith('/role') and set(body) == {'role'} and body['role'] in ['USER', 'ADMIN']
            assert user_id != 2, 'Self role change must be blocked in UI'
            assert not (user['status'] == 'WITHDRAWN' and body['role'] == 'ADMIN'), 'Withdrawn promotion must be blocked'
            if mode == 'hold': held.append(route); return
            if mode == 'mutation-error': respond_error(route, 500, 'INTERNAL_SERVER_ERROR', '권한 변경 실패'); return
            if mode == 'mutation-forbidden': respond_error(route, 403, 'FORBIDDEN', '권한이 없습니다.'); return
            if mode in ['conflict', 'conflict-withdrawn']:
                user['name'] = '수정된 회원'
                if mode == 'conflict-withdrawn': user['status'] = 'WITHDRAWN'
                mode = 'normal'
                respond_error(route, 409, 'CONCURRENT_MODIFICATION', '다른 사용자가 먼저 수정했습니다.'); return
            user['role'] = body['role']
            data = user
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1120), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',refreshToken:'fixture-refresh',userInfo:{user_id:2,name:'김운영',role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/users')
    table = page.get_by_role('region', name='회원 목록', exact=True)
    search = page.get_by_role('form', name='회원 검색')
    dialog = page.get_by_role('dialog', name='회원 상세 정보')
    expect(table.locator('tbody tr')).to_have_count(8)
    expect(table.get_by_role('heading')).to_contain_text('17명')
    expect(page.get_by_role('navigation', name='관리자 메뉴').get_by_role('link', name='회원 관리')).to_have_attribute('aria-current', 'page')
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=375, height=812))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1120))
    # Search applies only on submit, is server-side, and rejects one-character inputs.
    before = len(requests)
    search.get_by_label('이름 / 이메일').fill('김')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(search.get_by_role('alert')).to_contain_text('2글자')
    assert len(requests) == before
    search.get_by_label('이름 / 이메일').fill('  admin_kim  ')
    search.get_by_role('group', name='역할', exact=True).get_by_role('radio', name='관리자', exact=True).locator('..').click()
    search.get_by_role('group', name='상태', exact=True).get_by_role('radio', name='활성', exact=True).locator('..').click()
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.locator('tbody tr')).to_have_count(1)
    assert requests[-1][2] == dict(page=['1'], size=['8'], keyword=['admin_kim'], role=['ADMIN'], status=['ACTIVE'])
    search.get_by_role('button', name='초기화').click()
    expect(table.locator('tbody tr')).to_have_count(8)
    table.get_by_role('button', name='다음 페이지').click()
    expect(table.get_by_role('button', name='member9@inha.edu 상세보기')).to_be_visible()
    search.get_by_label('이름 / 이메일').fill('없는검색')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table).to_contain_text('조회된 회원이 없습니다.')
    assert requests[-1][2]['page'] == ['1']
    search.get_by_role('button', name='초기화').click()
    expect(table.locator('tbody tr')).to_have_count(8)
    # Native side panel, detail endpoint, timezone and mobile layout.
    table.get_by_role('button', name='hong@inha.edu 상세보기').click()
    expect(dialog.get_by_role('heading', name='홍길동')).to_be_visible()
    expect(dialog).to_contain_text('2026.03.02 14:22:01')
    assert any(path.endswith('/users/1') for _, path, _, _ in requests)
    page.screenshot(path=str(OUTPUT/'detail-desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'detail-mobile.png'), full_page=True)
    assert dialog.evaluate('(el) => el.scrollWidth <= el.clientWidth')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1120))
    for _ in range(5):
        page.keyboard.press('Tab')
        # Native modal dialogs may hand focus to browser chrome (reported as body),
        # but must never focus the inert search/table controls behind the panel.
        assert dialog.evaluate('(el) => document.activeElement === document.body || el.contains(document.activeElement)')
    dialog.get_by_role('button', name='관리자로 승격', exact=True).click()
    expect(dialog.get_by_role('group', name='권한 변경 확인')).to_contain_text('관리자 페이지 접근')
    page.keyboard.press('Escape')
    expect(dialog).to_be_visible()
    expect(dialog.get_by_role('group', name='권한 변경 확인')).to_have_count(0)
    assert not any(method == 'PATCH' for method, _, _, _ in requests)
    page.keyboard.press('Escape')
    expect(dialog).to_have_count(0)
    expect(table.get_by_role('button', name='hong@inha.edu 상세보기')).to_be_focused()
    assert page.evaluate('document.body.style.overflow') != 'hidden'
    # Self and withdrawn restrictions, including a withdrawn admin demotion.
    table.get_by_role('button', name='admin_kim@inha.edu 상세보기').click()
    expect(dialog).to_contain_text('자신의 권한은 변경할 수 없습니다.')
    expect(dialog.get_by_role('button', name='사용자로 변경')).to_be_disabled()
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    table.get_by_role('button', name='lee_withdraw@inha.edu 상세보기').click()
    expect(dialog.get_by_role('button', name='관리자로 승격')).to_be_disabled()
    expect(dialog).to_contain_text('2026.07.30 18:02:00')
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    table.get_by_role('button', name='lim.withdraw@inha.edu 상세보기').click()
    expect(dialog.get_by_role('heading', name='이름 없음')).to_be_visible()
    expect(dialog).to_contain_text('미완료')
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    table.get_by_role('button', name='kang.admin@inha.edu 상세보기').click()
    expect(dialog.get_by_role('button', name='사용자로 변경')).to_be_enabled()
    dialog.get_by_role('button', name='사용자로 변경').click()
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('status')).to_contain_text('사용자로 반영')
    expect(dialog.get_by_role('button', name='관리자로 승격')).to_be_disabled()
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    # Delayed mutation locks close/Escape/duplicate submission, updates both views.
    table.get_by_role('button', name='hong@inha.edu 상세보기').click()
    dialog.get_by_role('button', name='관리자로 승격').click()
    mode = 'hold'
    before = sum(method == 'PATCH' for method, _, _, _ in requests)
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('button', name='변경 중…')).to_be_disabled()
    expect(dialog.get_by_role('button', name='회원 상세 닫기')).to_be_disabled()
    page.keyboard.press('Escape')
    expect(dialog.get_by_role('group', name='권한 변경 확인')).to_be_visible()
    assert sum(method == 'PATCH' for method, _, _, _ in requests) == before + 1
    assert len(held) == 1
    rows[0]['role'] = 'ADMIN'
    mode = 'normal'
    held.pop().fulfill(json=dict(success=True, data=rows[0]))
    expect(dialog.get_by_role('status')).to_contain_text('관리자로 반영')
    expect(dialog.get_by_role('button', name='사용자로 변경')).to_be_enabled()
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    expect(table.locator('tbody tr').filter(has_text='hong@inha.edu')).to_contain_text('관리자')
    # 409 refreshes detail and requires another explicit confirmation.
    table.get_by_role('button', name='park.jisu@inha.edu 상세보기').click()
    mode = 'conflict'
    dialog.get_by_role('button', name='관리자로 승격').click()
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('heading', name='수정된 회원')).to_be_visible()
    expect(dialog.get_by_role('alert')).to_contain_text('확인 후 다시 시도')
    dialog.get_by_role('button', name='관리자로 승격').click()
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('status')).to_contain_text('관리자로 반영')
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    table.get_by_role('button', name='choi.minho@inha.edu 상세보기').click()
    mode = 'conflict-withdrawn'
    dialog.get_by_role('button', name='관리자로 승격').click()
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('button', name='관리자로 승격')).to_be_disabled()
    expect(dialog).to_contain_text('탈퇴한 회원은')
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    # Failure keeps the original role and supports explicit retry.
    table.get_by_role('button', name='yoon.sora@inha.edu 상세보기').click()
    mode = 'mutation-error'
    dialog.get_by_role('button', name='관리자로 승격').click()
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('alert')).to_contain_text('권한 변경 실패')
    expect(dialog.get_by_role('button', name='관리자로 승격')).to_be_enabled()
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    mode = 'detail-404'
    table.get_by_role('button', name='hong@inha.edu 상세보기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('존재하지 않는 회원')
    expect(dialog.get_by_role('button', name='사용자로 변경')).to_have_count(0)
    mode = 'normal'
    dialog.get_by_role('button', name='다시 시도').click()
    expect(dialog.get_by_role('heading', name='홍길동')).to_be_visible()
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    mode = 'detail-forbidden'
    table.get_by_role('button', name='hong@inha.edu 상세보기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('권한이 없습니다')
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    # Removing the last filtered member on page 2 recovers page 1/counts.
    mode = 'normal'
    rows[:] = [dict(rows[5], id=100+i, email=f'test{i}@inha.edu', role='USER') for i in range(9)]
    page.reload()
    search.get_by_role('group', name='역할', exact=True).get_by_role('radio', name='사용자', exact=True).locator('..').click()
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.get_by_role('heading')).to_contain_text('9명')
    table.get_by_role('button', name='다음 페이지').click()
    table.get_by_role('button', name='test8@inha.edu 상세보기').click()
    dialog.get_by_role('button', name='관리자로 승격').click()
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(dialog.get_by_role('status')).to_contain_text('관리자로 반영')
    dialog.get_by_role('button', name='회원 상세 닫기').click()
    expect(table.get_by_role('heading')).to_contain_text('8명')
    expect(table.locator('tbody tr')).to_have_count(8)
    expect(table.get_by_role('button', name='1', exact=True)).to_have_attribute('aria-current', 'page')
    mode = 'list-error'
    page.reload()
    expect(table.get_by_role('alert')).to_contain_text('불러오지 못했습니다', timeout=20000)
    mode = 'normal'
    table.get_by_role('button', name='다시 시도').click()
    expect(table.locator('tbody tr')).to_have_count(8)
    mode = 'forbidden'
    requests.clear()
    page.reload()
    expect(page.get_by_role('heading', name='관리자 접근 권한을 확인해 주세요')).to_be_visible()
    page.wait_for_timeout(1000)
    assert len(requests) == 1
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE + '/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/users'
    assert not errors, errors
    browser.close()
print('PASS: MANUSR list/search/filters/pagination/detail, promotion/demotion, self/withdrawn restrictions, pending lock, 409 refresh, filtered last page, errors, focus, desktop/mobile')
