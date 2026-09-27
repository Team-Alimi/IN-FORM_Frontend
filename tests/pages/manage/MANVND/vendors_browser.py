"""Vite :5173 + Python Playwright. API fixtures prevent real vendor changes."""
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests, errors, held = [], [], []
mode = 'normal'
names = ['컴퓨터공학과', '컴퓨터공학 학술동아리 IUPC', '학생지원팀', '전자공학과', '중앙동아리 인하밴드', '취업지원센터', '인하대 산업공학과', '중앙동아리 인하극회']
initials = ['cse_inha', 'club_iupc', 'student_affairs', 'ee_inha', 'club_inhaband', 'career_center', 'ie_inha', 'club_drama']
rows = [dict(id=i+1, name=names[i % 8] if i < 8 else f'추가 제공처 {i+1}', initial=initials[i] if i < 8 else f'extra{i}', type='CLUB' if i in [1,4,7] else 'SCHOOL', is_active=i not in [2,6], homepage_url=f'https://example.com/vendor/{i+1}', created_at='2026-01-10T01:00:00Z') for i in range(10)]
rows[8]['homepage_url'] = 'javascript:alert(1)'
rows[9].pop('homepage_url')

def fail(route, status, code, message):
    route.fulfill(status=status, json=dict(success=False, error=dict(code=code, message=message)))

def route_api(route):
    global mode
    req = route.request
    path = urlparse(req.url).path
    query = parse_qs(urlparse(req.url).query)
    body = req.post_data_json if req.method in ['POST', 'PATCH'] else None
    requests.append((req.method, path, query, body))
    assert path.startswith('/api/v1/admin/vendors'), path
    if mode == 'forbidden': fail(route, 403, 'FORBIDDEN', '권한이 없습니다.'); return
    if req.method == 'GET':
        assert path == '/api/v1/admin/vendors' and set(query) <= {'type', 'is_active'}
        if mode == 'list-error': fail(route, 500, 'INTERNAL_SERVER_ERROR', '서버 오류'); return
        data = rows[:]
        if query.get('type'): data = [r for r in data if r['type'] == query['type'][0]]
        if query.get('is_active'): data = [r for r in data if r['is_active'] == (query['is_active'][0] == 'true')]
    else:
        assert req.method in ['POST', 'PATCH'], req.method
        if mode == 'hold': held.append(route); return
        if mode == 'save-error': fail(route, 500, 'INTERNAL_SERVER_ERROR', '저장 요청 실패'); return
        if mode == 'save-forbidden': fail(route, 403, 'FORBIDDEN', '권한이 없습니다.'); return
        if req.method == 'POST':
            assert set(body) <= {'name', 'initial', 'type', 'homepage_url'}
            assert body['name'] == body['name'].strip() and body['initial'] == body['initial'].strip()
            assert not any(c.isspace() for c in body['initial'])
            if any(r['initial'] == body['initial'] for r in rows):
                fail(route, 409, 'DUPLICATE_RESOURCE', '이미 쓰이고 있는 크롤러 식별자입니다: '+body['initial']); return
            item = dict(body, id=max(r['id'] for r in rows)+1, is_active=True, created_at='2026-09-27T01:00:00Z')
            rows.append(item)
            data = dict(item, warning=f'크롤러 시드에 "vendor": "{item["initial"]}" 를 추가해야 수집이 시작됩니다.')
            if mode == 'post-refresh-error': mode = 'list-error'
        else:
            vendor_id = int(path.rsplit('/', 1)[1])
            assert set(body) <= {'name', 'homepage_url', 'is_active'} and body
            item = next((r for r in rows if r['id'] == vendor_id), None)
            if mode == 'missing' or item is None: fail(route, 404, 'VENDOR_NOT_FOUND', '존재하지 않는 제공처입니다.'); return
            was_active = item['is_active']
            item.update(body)
            if item.get('homepage_url') == '': item.pop('homepage_url')
            data = dict(item)
            if was_active and not item['is_active']:
                data['warning'] = f'목록·필터에서만 숨겨집니다. 수집을 멈추려면 크롤러 시드에서 "{item["initial"]}" 를 함께 빼야 합니다.'
    route.fulfill(status=201 if req.method == 'POST' else 200, json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1120), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{user_id:2,name:'관리자01',role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/vendors')
    table = page.get_by_role('region', name='제공처 목록', exact=True)
    search = page.get_by_role('form', name='제공처 검색 필터')
    dialog = page.get_by_role('dialog')
    add = page.get_by_role('button', name='제공처/동아리 추가', exact=True)
    expect(table.locator('tbody tr')).to_have_count(8)
    expect(table.get_by_role('heading')).to_contain_text('10개')
    expect(page.get_by_role('navigation', name='관리자 메뉴').get_by_role('link', name='제공처/동아리 관리')).to_have_attribute('aria-current', 'page')
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=375, height=812))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1120))
    # Local pagination does not send unsupported API params; unsafe URLs stay text.
    before = len(requests)
    table.get_by_role('button', name='다음 페이지').click()
    expect(table.locator('tbody tr')).to_have_count(2)
    expect(table.get_by_role('link')).to_have_count(0)
    expect(table).to_contain_text('javascript:alert(1)')
    assert len(requests) == before
    search.get_by_role('radio', name='교내 기관/학과 (SCHOOL)', exact=True).locator('..').click()
    search.get_by_role('radio', name='숨김', exact=True).locator('..').click()
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.locator('tbody tr')).to_have_count(2)
    assert requests[-1][2] == dict(type=['SCHOOL'], is_active=['false'])
    search.get_by_role('radio', name='동아리 (CLUB)', exact=True).locator('..').click()
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table).to_contain_text('조회된 제공처가 없습니다.')
    search.get_by_role('button', name='초기화').click()
    expect(table.locator('tbody tr')).to_have_count(8)
    # Real query invalidations are recorded without changing their behavior.
    page.evaluate("""async () => {
      const url = performance.getEntriesByType('resource').find(e => e.name.includes('/@tanstack_react-query.js')).name;
      const { QueryClient } = await import(url); const original = QueryClient.prototype.invalidateQueries;
      window.testInvalidations = [];
      QueryClient.prototype.invalidateQueries = function (...args) { window.testInvalidations.push(args[0]?.queryKey?.[0]); return original.apply(this, args); };
    }""")
    add.click()
    expect(dialog.get_by_role('heading')).to_have_text('제공처 / 동아리 등록')
    page.screenshot(path=str(OUTPUT/'create-desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'create-mobile.png'))
    assert dialog.evaluate('(el) => el.scrollWidth <= el.clientWidth')
    page.set_viewport_size(dict(width=1280, height=1120))
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('이름을 입력')
    dialog.get_by_label('제공처 이름', exact=True).fill('  새 동아리  ')
    dialog.get_by_label('식별자 (initial)', exact=True).fill('공백 식별자')
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('공백')
    dialog.get_by_label('식별자 (initial)', exact=True).fill('cse_inha')
    dialog.get_by_label('홈페이지 URL', exact=True).fill('javascript:alert(1)')
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('https://')
    assert not any(method == 'POST' for method, _, _, _ in requests)
    dialog.get_by_label('홈페이지 URL', exact=True).fill('')
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('이미 쓰이고')
    expect(dialog.get_by_label('제공처 이름', exact=True)).to_have_value('  새 동아리  ')
    dialog.get_by_label('식별자 (initial)', exact=True).fill('  새동아리_UPPER  ')
    dialog.get_by_role('radio', name='CLUB (동아리)', exact=True).check()
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('status')).to_contain_text('제공처를 등록했습니다.')
    expect(dialog.get_by_role('status')).to_contain_text('"새동아리_UPPER" 를 추가')
    expect(dialog.get_by_role('button', name='확인', exact=True)).to_be_enabled()
    assert any(body == dict(name='새 동아리', initial='새동아리_UPPER', type='CLUB') for _, _, _, body in requests)
    assert {'adminVendors', 'adminDashboard', 'adminEditor', 'vendors', 'clubs', 'eventDetail'} <= set(page.evaluate('window.testInvalidations'))
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('크롤러 시드')
    expect(table.get_by_role('heading')).to_contain_text('11개')
    # Edit shows immutable fields; homepage deletion is an explicit empty string.
    table.get_by_role('button', name='컴퓨터공학과 (#1) 수정').click()
    expect(dialog.get_by_label('식별자 (initial)', exact=True)).to_have_attribute('readonly', '')
    expect(dialog.get_by_role('button', name='변경사항 저장')).to_be_disabled()
    expect(dialog.get_by_role('radio', name='SCHOOL (학과/기관)')).to_have_count(0)
    page.screenshot(path=str(OUTPUT/'edit-desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'edit-mobile.png'))
    assert dialog.evaluate('(el) => el.scrollWidth <= el.clientWidth')
    page.set_viewport_size(dict(width=1280, height=1120))
    dialog.get_by_label('홈페이지 URL', exact=True).fill('')
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('status')).to_contain_text('변경사항을 저장')
    dialog.get_by_role('button', name='확인', exact=True).click()
    assert any(path.endswith('/1') and body == {'homepage_url': ''} for _, path, _, body in requests)
    expect(table.locator('tbody tr').filter(has_text='cse_inha').get_by_role('link')).to_have_count(0)
    # Hidden status still allows edit and can be reactivated, without stale warning.
    table.get_by_role('button', name='컴퓨터공학과 (#1) 수정').click()
    dialog.get_by_role('radio', name='숨김 (비활성화)', exact=True).locator('..').click()
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('status')).to_contain_text('수집을 멈추려면')
    dialog.get_by_role('button', name='확인', exact=True).click()
    assert any(path.endswith('/1') and body == {'is_active': False} for _, path, _, body in requests)
    expect(table.locator('tbody tr').filter(has_text='cse_inha')).to_contain_text('숨김')
    table.get_by_role('button', name='컴퓨터공학과 (#1) 수정').click()
    dialog.get_by_role('radio', name='활성화 (Active)', exact=True).locator('..').click()
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('status')).not_to_contain_text('수집을 멈추려면')
    dialog.get_by_role('button', name='확인', exact=True).click()
    # Existing non-web URLs don't block name-only updates and are not re-sent.
    table.get_by_role('button', name='다음 페이지').click()
    table.get_by_role('button', name='추가 제공처 9 (#9) 수정').click()
    dialog.get_by_label('제공처 이름', exact=True).fill('수정한 이름')
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('status')).to_contain_text('변경사항을 저장')
    dialog.get_by_role('button', name='확인', exact=True).click()
    assert any(path.endswith('/9') and body == {'name': '수정한 이름'} for _, path, _, body in requests)
    # Delayed save blocks duplicate requests, Escape and close.
    table.get_by_role('button', name='추가 제공처 10 (#10) 수정').click()
    dialog.get_by_label('홈페이지 URL', exact=True).fill('https://new.example.com')
    mode = 'hold'
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('button', name='저장 중…')).to_be_disabled()
    expect(dialog.get_by_role('button', name='제공처 창 닫기')).to_be_disabled()
    page.keyboard.press('Escape')
    expect(dialog).to_be_visible()
    assert len(held) == 1
    rows[9]['homepage_url'] = 'https://new.example.com'
    mode = 'normal'
    held.pop().fulfill(json=dict(success=True, data=rows[9]))
    expect(dialog.get_by_role('status')).to_contain_text('변경사항을 저장')
    dialog.get_by_role('button', name='확인', exact=True).click()
    # Failed writes preserve input. Missing vendors require closing/reloading.
    table.get_by_role('button', name='추가 제공처 10 (#10) 수정').click()
    dialog.get_by_label('제공처 이름', exact=True).fill('저장할 이름')
    mode = 'save-error'
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('alert')).to_contain_text('저장 요청 실패')
    expect(dialog.get_by_label('제공처 이름', exact=True)).to_have_value('저장할 이름')
    mode = 'missing'
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('alert')).to_contain_text('존재하지 않는')
    expect(dialog.get_by_role('button', name='변경사항 저장')).to_be_disabled()
    dialog.get_by_role('button', name='취소').click()
    mode = 'normal'
    # A successful POST stays successful even when the subsequent GET fails.
    add.click()
    dialog.get_by_label('제공처 이름', exact=True).fill('컴퓨터공학과')
    dialog.get_by_label('식별자 (initial)', exact=True).fill('another_CSE')
    mode = 'post-refresh-error'
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('status')).to_contain_text('제공처를 등록했습니다.')
    expect(dialog.get_by_role('button', name='등록하기')).to_have_count(0)
    expect(dialog.get_by_role('button', name='확인', exact=True)).to_be_enabled(timeout=20000)
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(table.get_by_role('alert')).to_contain_text('불러오지 못했습니다')
    mode = 'normal'
    table.get_by_role('button', name='다시 시도').click()
    expect(table.locator('tbody tr')).to_have_count(8)
    # Filtered last page recovers after hiding its final item.
    rows[:] = [dict(rows[0], id=100+i, initial=f'page{i}', is_active=True) for i in range(9)]
    page.reload()
    search.get_by_role('radio', name='활성', exact=True).locator('..').click()
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.get_by_role('heading')).to_contain_text('9개')
    table.get_by_role('button', name='다음 페이지').click()
    table.get_by_role('button', name='컴퓨터공학과 (#108) 수정').click()
    dialog.get_by_role('radio', name='숨김 (비활성화)', exact=True).locator('..').click()
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('status')).to_contain_text('수집을 멈추려면')
    dialog.get_by_role('button', name='확인', exact=True).click()
    expect(table.locator('tbody tr')).to_have_count(8)
    expect(table.get_by_role('button', name='1', exact=True)).to_have_attribute('aria-current', 'page')
    add.click()
    before = len(requests)
    page.keyboard.press('Escape')
    expect(dialog).to_have_count(0)
    expect(add).to_be_focused()
    assert len(requests) == before
    mode = 'forbidden'
    requests.clear()
    page.reload()
    expect(page.get_by_role('heading', name='관리자 접근 권한을 확인해 주세요')).to_be_visible()
    page.wait_for_timeout(1000)
    assert len(requests) == 1
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE + '/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/vendors'
    assert not errors, errors
    browser.close()
print('PASS: MANVND filters/local pages, create/duplicate/validation, immutable fields, homepage clear, hide/reactivate warnings, cache refresh, pending/errors, last page, safe URLs, desktop/mobile')
