"""Run against Vite :5173. Every backend request is intercepted; no real deletion."""
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests, errors, held = [], [], []
mode = 'normal'
titles = ['2026학년도 1학기 수강신청 및 유의사항 안내', '2026년 1학기 수강정정 기간 안내', '제15회 창업 아이디어 경진대회 모집', 'AI 활용 취업 전략 특강 참가 신청', '교내 성적 우수 장학생 신청 안내', '2026-1학기 졸업 예정자 신청 안내', '글로벌 SW 공모전 참가팀 모집', '해외 인턴십 준비 설명회 개최 안내']
statuses = ['PUBLISHED', 'PENDING_REVIEW', 'PUBLISHED', 'READY_TO_PUBLISH', 'PENDING_REVIEW', 'READY_TO_PUBLISH', 'DRAFT', 'PUBLISHED']
rows = [dict(id=182+i, title=titles[i % 8] if i < 8 else f'추가 휴지통 게시글 {i}', status='TRASHED', previous_status=statuses[i % 8], starts_on='2026-04-01', ends_on='2026-04-30', updated_at='2026-03-15T10:00:00+09:00', categories=[dict(id=1, name='학사')], vendors=[dict(id=5, name='학사지원팀')]) for i in range(55)]
rows[8].pop('previous_status')
rows[-1].update(title='마지막 페이지 검색 대상', categories=[dict(id=9, name='비활성 분류')], vendors=[dict(id=9, name='과거 제공처')])

def route_api(route):
    req = route.request
    path = urlparse(req.url).path
    query = parse_qs(urlparse(req.url).query)
    body = req.post_data_json if req.method == 'POST' else None
    requests.append((path, query, body))
    if mode == 'forbidden':
        route.fulfill(status=403, json=dict(success=False, error=dict(code='FORBIDDEN', message='권한이 없습니다.')))
        return
    if path.endswith('/trash'):
        assert req.method == 'GET' and set(query) == {'page', 'size'} and query['size'] == ['50'], (path, query)
        number = int(query['page'][0])
        if mode == 'later-error' and number == 2:
            route.fulfill(status=500, json=dict(success=False, error=dict(message='서버 오류')))
            return
        if mode == 'hold-list' and number == 2:
            held.append(route)
            return
        total = len(rows)
        data = dict(content=rows[(number-1)*50:number*50], page_info=dict(current_page=number, size=50, total_items=total, total_pages=(total+49)//50, has_next=number*50<total))
    else:
        assert path.endswith('/bulk/restore') or path.endswith('/bulk/delete'), path
        assert req.method == 'POST' and body and set(body) == {'ids'} and 0 < len(body['ids']) <= 8
        if mode == 'hold':
            held.append(route)
            return
        if mode == 'mutation-error':
            route.fulfill(status=500, json=dict(success=False, error=dict(message='처리 요청 실패')))
            return
        succeeded = [] if mode == 'all-failed' else body['ids'][:1] if mode == 'partial' else body['ids'][:-1] if mode == 'last-failed' else body['ids']
        data = dict(succeeded=succeeded, failed=[dict(id=i, code='RESOURCE_BUSY', message='다시 시도해 주세요.') for i in body['ids'] if i not in succeeded])
        rows[:] = [r for r in rows if r['id'] not in succeeded]
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1180), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{name:'관리자01',role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/garbage')
    table = page.get_by_role('region', name='휴지통 보관 게시물', exact=True)
    search = page.get_by_role('form', name='휴지통 게시글 검색')
    expect(table.locator('tbody tr')).to_have_count(8)
    expect(table.get_by_role('button', name='선택 복구')).to_be_disabled()
    assert any(q.get('page') == ['2'] for _, q, _ in requests)
    expect(table.get_by_role('columnheader', name='삭제 전 상태')).to_be_visible()
    expect(table.get_by_role('link', name=titles[0])).to_have_attribute('href', '/manage/detail/182')
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1180))
    # Local searches include the last API page and inactive classifications.
    before = len(requests)
    search.get_by_label('게시글 제목', exact=True).fill('마지막 페이지')
    search.get_by_label('출처', exact=True).fill('과거')
    search.get_by_label('카테고리', exact=True).select_option('9')
    search.get_by_label('행사 기간 시작일').fill('2026-04-01')
    search.get_by_label('행사 기간 종료일').fill('2026-04-30')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.locator('tbody tr')).to_have_count(1)
    expect(table.get_by_label('게시글 236 선택')).to_be_visible()
    assert len(requests) == before
    # Date search uses overlap, rather than requiring containment.
    search.get_by_label('행사 기간 시작일').fill('2026-04-10')
    search.get_by_label('행사 기간 종료일').fill('2026-04-20')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.get_by_label('게시글 236 선택')).to_be_visible()
    search.get_by_label('행사 기간 시작일').fill('2026-05-01')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(search.get_by_role('alert')).to_contain_text('종료일')
    search.get_by_role('button', name='초기화').click()
    search.get_by_role('radio', name='임시저장', exact=True).check()
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.locator('tbody tr')).to_have_count(7)
    for row in table.locator('tbody tr').all(): expect(row).to_contain_text('임시저장')
    search.get_by_role('button', name='초기화').click()
    search.get_by_label('게시글 ID', exact=True).fill('190')
    search.get_by_role('button', name='조회', exact=True).click()
    table.get_by_label('게시글 190 선택').check()
    expect(table).to_contain_text('이력 없음')
    expect(table.get_by_role('button', name='선택 복구')).to_be_disabled()
    expect(table.get_by_role('button', name='영구 삭제')).to_be_enabled()
    table.get_by_role('button', name='영구 삭제').click()
    expect(page.get_by_role('dialog')).to_contain_text('영구 삭제 후에는 복구할 수 없습니다.')
    page.keyboard.press('Escape')
    assert not any(body for _, _, body in requests)
    search.get_by_role('button', name='초기화').click()
    table.get_by_label('게시글 182 선택').check()
    table.get_by_role('button', name='다음 페이지').click()
    expect(table.get_by_role('button', name='선택 복구')).to_be_disabled()
    table.get_by_role('button', name='이전 페이지').click()
    # Partial restoration preserves failures and refreshes the list.
    mode = 'partial'
    table.get_by_label('게시글 182 선택').check()
    table.get_by_label('게시글 183 선택').check()
    table.get_by_role('button', name='선택 복구').click()
    expect(page.get_by_role('dialog')).to_contain_text('삭제 직전 상태')
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('1건 복구 완료 · 1건 실패')
    expect(page.get_by_role('status')).to_contain_text('#183: 다시 시도해 주세요.')
    expect(page.get_by_role('dialog')).to_have_count(0)
    expect(table.get_by_label('게시글 183 선택')).to_be_checked()
    expect(table.get_by_label('게시글 182 선택')).to_have_count(0)
    # In-flight permanent deletion locks controls and rejects Escape.
    mode = 'hold'
    table.get_by_role('button', name='영구 삭제').click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('dialog').get_by_role('button', name='처리 중…')).to_be_disabled()
    expect(search.get_by_role('button', name='조회', exact=True)).to_be_disabled()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_be_visible()
    assert len(held) == 1
    rows[:] = [r for r in rows if r['id'] != 183]
    mode = 'normal'
    held.pop().fulfill(json=dict(success=True, data=dict(succeeded=[183], failed=[])))
    expect(page.get_by_role('status')).to_contain_text('1건 영구 삭제 완료')
    expect(page.get_by_role('dialog')).to_have_count(0)
    table.get_by_label('게시글 184 선택').check()
    mode = 'all-failed'
    table.get_by_role('button', name='선택 복구').click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('0건 복구 완료 · 1건 실패')
    expect(page.get_by_role('dialog')).to_have_count(0)
    expect(table.get_by_label('게시글 184 선택')).to_be_checked()
    mode = 'mutation-error'
    table.get_by_role('button', name='선택 복구').click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('처리 요청 실패')
    expect(table.get_by_label('게시글 184 선택')).to_be_checked()
    # An incomplete multi-page response must never enable searches/actions.
    mode = 'hold-list'
    page.reload()
    expect(table.get_by_role('status')).to_be_visible()
    expect(search.get_by_role('button', name='조회', exact=True)).to_be_disabled()
    expect(table.locator('tbody tr')).to_have_count(0)
    page.wait_for_timeout(500)
    assert len(held) == 1
    mode = 'normal'
    held.pop().fulfill(json=dict(success=True, data=dict(content=rows[50:], page_info=dict(current_page=2, size=50, total_items=len(rows), total_pages=2, has_next=False))))
    expect(table.locator('tbody tr')).to_have_count(8)
    mode = 'later-error'
    page.reload()
    expect(table.get_by_role('alert')).to_contain_text('불러오지 못했습니다', timeout=20000)
    expect(search.get_by_role('button', name='조회', exact=True)).to_be_disabled()
    mode = 'normal'
    table.get_by_role('button', name='다시 시도').click()
    expect(table.locator('tbody tr')).to_have_count(8)
    # Removing seven successes on page 2 leaves its last failure on page 2.
    # The eight preceding rows were not selected and cannot be removed by this action.
    for action in ['선택 복구', '영구 삭제']:
        rows[:] = [dict(rows[0], id=500+i, previous_status='PUBLISHED') for i in range(24)]
        page.reload()
        expect(table.locator('tbody tr')).to_have_count(8)
        table.get_by_role('button', name='다음 페이지').click()
        expect(table.get_by_label('게시글 508 선택')).to_be_visible()
        table.get_by_label('휴지통 보관 게시물 전체 선택').check()
        mode = 'last-failed'
        table.get_by_role('button', name=action, exact=True).click()
        page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        expect(page.get_by_role('status')).to_contain_text('7건')
        expect(page.get_by_role('status')).to_contain_text('1건 실패')
        expect(table.get_by_role('button', name='2', exact=True)).to_have_attribute('aria-current', 'page')
        expect(table.get_by_label('게시글 515 선택')).to_be_checked()
        expect(table.get_by_role('button', name=action, exact=True)).to_be_enabled()
        assert requests[-2][2] == {'ids': list(range(508, 516))}
        mode = 'normal'
        table.get_by_role('button', name=action, exact=True).click()
        page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        assert any(body == {'ids': [515]} for _, _, body in requests)
    # Last visible page disappears after deleting its final row.
    rows[:] = rows[:9]
    page.reload()
    expect(table.locator('tbody tr')).to_have_count(8)
    table.get_by_role('button', name='다음 페이지').click()
    expect(table.locator('tbody tr')).to_have_count(1)
    table.get_by_label('휴지통 보관 게시물 전체 선택').check()
    table.get_by_role('button', name='영구 삭제').click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('dialog')).to_have_count(0)
    expect(table.locator('tbody tr')).to_have_count(8)
    rows.clear()
    page.reload()
    expect(table).to_contain_text('조회된 게시글이 없습니다.')
    mode = 'forbidden'
    requests.clear()
    page.reload()
    expect(page.get_by_role('heading', name='관리자 접근 권한을 확인해 주세요')).to_be_visible()
    page.wait_for_timeout(1000)
    assert len(requests) == 1, requests
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE + '/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/garbage'
    assert not errors, errors
    browser.close()
print('PASS: MANGBG full collection/search, previous statuses, page selection, restore/delete, cancellation, pending lock, partial/all failures, errors/retry/403, last page, desktop/mobile')
