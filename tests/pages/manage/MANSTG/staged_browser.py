"""Vite on :5173; Python + Playwright. API fixtures prevent real publication."""
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests = []
errors = []
held = []
mode = 'normal'
partial = False
entries = [(185, 'AI 활용 취업 전략 특강 참가 신청', '특강·세미나'), (187, '2026-1학기 졸업 예정자 신청 안내', '학사'), (190, '민간 장학재단 장학생 모집 공고', '장학금'), (192, '산학협력 장학금 2차 모집 안내', '장학금'), (193, '2026-1학기 재수강 신청 일정 안내', '학사'), (195, '진로 탐색 워크숍 참가자 모집', '특강·세미나')]
rows = [dict(id=i, title=title, status='READY_TO_PUBLISH', starts_on='2026-04-10', ends_on='2026-04-10', updated_at='2026-03-15T10:00:00+09:00', categories=[dict(id=1, name=category)], vendors=[dict(id=5, name='취업지원센터')]) for i, title, category in entries]
rows.extend([dict(rows[0], id=300, status='DRAFT'), dict(rows[0], id=301, status='PENDING_REVIEW'), dict(rows[0], id=302, status='PUBLISHED')])

def route_api(route):
    req = route.request
    path = urlparse(req.url).path
    query = parse_qs(urlparse(req.url).query)
    body = req.post_data_json if req.method == 'POST' else None
    requests.append((path, query, body))
    if mode == 'forbidden':
        route.fulfill(status=403, json=dict(success=False, error=dict(code='FORBIDDEN', message='권한이 없습니다.')))
        return
    if path.endswith('/stats'):
        data = dict(pending_review=1, ready_to_publish=sum(r['status']=='READY_TO_PUBLISH' for r in rows))
    elif path.endswith('/categories'):
        data = [dict(id=1, name='특강·세미나')]
    elif path.endswith('/vendors'):
        data = [dict(id=5, name='취업지원센터')]
    elif '/bulk/' in path:
        assert path.endswith('/publish') or path.endswith('/trash'), path
        assert body and set(body)=={'ids'} and 0 < len(body['ids']) <= 200
        if mode == 'hold':
            held.append(route)
            return
        if mode == 'mutation-error':
            route.fulfill(status=500, json=dict(success=False, error=dict(message='잠시 후 다시 시도해 주세요.')))
            return
        succeeded = [] if mode == 'all-failed' else body['ids'][:1] if partial else body['ids']
        data = dict(succeeded=succeeded, failed=[dict(id=i, code='CONCURRENT_MODIFICATION', message='다른 관리자가 수정했습니다.') for i in body['ids'] if i not in succeeded])
        for row in rows:
            if row['id'] in succeeded: row['status'] = 'PUBLISHED' if path.endswith('/publish') else 'TRASHED'
    else:
        assert query.get('status') == ['READY_TO_PUBLISH'] and 'needs_check' not in query, query
        if mode == 'list-error':
            route.fulfill(status=500, json=dict(success=False, error=dict(message='서버 오류')))
            return
        filtered = [r for r in rows if r['status']=='READY_TO_PUBLISH']
        if query.get('article_id'): filtered = [r for r in filtered if str(r['id']) == query['article_id'][0]]
        if query.get('keyword'): filtered = [r for r in filtered if query['keyword'][0] in r['title']]
        page = int(query['page'][0]); size = int(query['size'][0]); total = len(filtered)
        content = filtered[(page-1)*size:page*size]
        if mode == 'unexpected-status' and content: content = [dict(content[0], status='DRAFT')] + content[1:]
        data = dict(content=content, page_info=dict(current_page=page, size=size, total_items=total, total_pages=(total+size-1)//size, has_next=page*size<total))
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1044), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{name:'관리자01',role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/staged')
    table = page.get_by_role('region', name='반영 대기 게시글', exact=True)
    search = page.get_by_role('form', name='반영 대기 게시글 검색')
    expect(table.locator('tbody tr')).to_have_count(6)
    expect(page.get_by_role('heading', name='반영 대기 게시글 (6)', exact=True)).to_be_visible()
    expect(table.get_by_role('button', name='운영 반영', exact=True)).to_be_disabled()
    expect(table.get_by_label('게시글 300 선택')).to_have_count(0)
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1044))
    # Additional page and optional fields.
    rows.extend([dict(rows[0], id=i, title=f'추가 반영 대기 {i}') for i in [197,198,199]])
    rows[-1].pop('starts_on'); rows[-1]['categories'] = []; rows[-1]['vendors'] = []
    page.reload()
    expect(table.locator('tbody tr')).to_have_count(8)
    # Observe real query invalidations without changing cache behavior.
    page.evaluate("""async () => {
      const url = performance.getEntriesByType('resource')
        .find(entry => entry.name.includes('/@tanstack_react-query.js')).name;
      const { QueryClient } = await import(url);
      const original = QueryClient.prototype.invalidateQueries;
      window.testInvalidations = [];
      QueryClient.prototype.invalidateQueries = function (...args) {
        window.testInvalidations.push(args[0]?.queryKey?.[0]);
        return original.apply(this, args);
      };
    }""")
    table.get_by_label('게시글 185 선택').check()
    table.get_by_role('button', name='다음 페이지').click()
    expect(table.get_by_label('게시글 199 선택')).to_be_visible()
    expect(table.get_by_role('button', name='운영 반영', exact=True)).to_be_disabled()
    # Cancel and delete the last page: selection must be page-local.
    table.get_by_label('게시글 199 선택').check()
    table.get_by_role('button', name='삭제', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='취소', exact=True).click()
    assert not any(body for _, _, body in requests)
    table.get_by_role('button', name='삭제', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('1건 휴지통으로 이동 완료')
    expect(table.locator('tbody tr')).to_have_count(8)
    assert any(path.endswith('/bulk/trash') and body == {'ids':[199]} for path, _, body in requests)
    assert {'notifications', 'notificationsUnreadCount'} <= set(page.evaluate('window.testInvalidations'))
    page.evaluate('window.testInvalidations = []')
    search.get_by_label('게시글 제목', exact=True).fill('없는 제목')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.get_by_text('조회된 게시글이 없습니다.')).to_be_visible()
    expect(page.get_by_role('heading', name='반영 대기 게시글 (8)', exact=True)).to_be_visible()
    search.get_by_role('button', name='초기화', exact=True).click()
    search.get_by_label('게시글 ID', exact=True).fill('185')
    search.get_by_label('출처', exact=True).select_option('5')
    search.get_by_label('카테고리', exact=True).select_option('1')
    search.get_by_label('행사 기간 시작일').fill('2026-04-01')
    search.get_by_label('행사 기간 종료일').fill('2026-04-30')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(table.locator('tbody tr')).to_have_count(1)
    assert any(q.get('article_id')==['185'] and q.get('vendor_id')==['5'] and q.get('category_id')==['1'] and q.get('starts_from')==['2026-04-01'] and q.get('ends_to')==['2026-04-30'] for _, q, _ in requests)
    search.get_by_label('행사 기간 시작일').fill('2026-05-01')
    before = len(requests)
    search.get_by_role('button', name='조회', exact=True).click()
    expect(search.get_by_role('alert')).to_contain_text('종료일')
    assert len(requests)==before
    search.get_by_role('button', name='초기화', exact=True).click()
    # Publication explicitly confirms user-visible changes; partial success stays selected.
    table.get_by_label('게시글 185 선택').check()
    table.get_by_label('게시글 187 선택').check()
    table.get_by_role('button', name='운영 반영', exact=True).click()
    expect(page.get_by_role('dialog')).to_contain_text('사용자에게 게시글이 공개됩니다.')
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    partial = True
    table.get_by_role('button', name='운영 반영', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('1건 운영 반영 완료 · 1건 실패')
    expect(page.get_by_role('status')).to_contain_text('#187: 다른 관리자가 수정했습니다.')
    expect(table.get_by_label('게시글 185 선택')).to_have_count(0)
    expect(table.get_by_label('게시글 187 선택')).to_be_checked()
    expect(page.get_by_role('heading', name='반영 대기 게시글 (7)', exact=True)).to_be_visible()
    assert any(path.endswith('/bulk/publish') and body=={'ids':[185,187]} for path, _, body in requests)
    assert {'notifications', 'notificationsUnreadCount'} <= set(page.evaluate('window.testInvalidations'))
    page.evaluate('window.testInvalidations = []')
    # Pending requests lock both confirmation and filters; Escape cannot interrupt the write.
    partial = False
    table.get_by_label('게시글 187 선택').uncheck()
    table.get_by_label('게시글 190 선택').check()
    mode = 'hold'
    table.get_by_role('button', name='운영 반영', exact=True).click()
    before = len([body for _, _, body in requests if body])
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('dialog').get_by_role('button', name='처리 중…')).to_be_disabled()
    expect(search.get_by_role('button', name='조회', exact=True)).to_be_disabled()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_be_visible()
    assert len([body for _, _, body in requests if body]) == before+1
    assert len(held)==1
    for row in rows:
        if row['id']==190: row['status']='PUBLISHED'
    held.pop().fulfill(json=dict(success=True, data=dict(succeeded=[190], failed=[])))
    mode = 'normal'
    expect(page.get_by_role('status')).to_contain_text('1건 운영 반영 완료')
    expect(page.get_by_role('dialog')).to_have_count(0)
    expect(table.get_by_label('게시글 190 선택')).to_have_count(0)
    assert {'notifications', 'notificationsUnreadCount'} <= set(page.evaluate('window.testInvalidations'))
    page.evaluate('window.testInvalidations = []')
    mode = 'all-failed'
    table.get_by_label('게시글 187 선택').check()
    table.get_by_role('button', name='운영 반영', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('0건 운영 반영 완료 · 1건 실패')
    expect(page.get_by_role('dialog')).to_have_count(0)
    invalidations = set(page.evaluate('window.testInvalidations'))
    assert 'adminDashboard' in invalidations
    assert not {'notifications', 'notificationsUnreadCount'} & invalidations
    mode = 'mutation-error'
    table.get_by_label('게시글 187 선택').check()
    table.get_by_role('button', name='운영 반영', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('잠시 후 다시 시도')
    expect(table.get_by_label('게시글 187 선택')).to_be_checked()
    # Defensive status gating even if a stale/incorrect row is returned.
    mode = 'unexpected-status'
    page.reload()
    table.get_by_label('게시글 187 선택').check()
    expect(table.get_by_role('button', name='운영 반영', exact=True)).to_be_disabled()
    mode = 'list-error'
    page.reload()
    expect(table.get_by_role('alert')).to_contain_text('게시글을 불러오지 못했습니다.', timeout=15000)
    mode = 'normal'
    table.get_by_role('button', name='다시 시도').click()
    expect(table.locator('tbody tr')).to_have_count(6)
    mode = 'forbidden'
    requests.clear()
    page.reload()
    expect(page.get_by_role('heading', name='관리자 접근 권한을 확인해 주세요')).to_be_visible()
    page.wait_for_timeout(8000)
    assert len(requests)<=4, requests
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE+'/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/staged'
    assert not errors, errors
    browser.close()
print('PASS: MANSTG status/search/pagination, publish/trash JSON, confirmation/cancel, partial failures, pending lock, count refresh, last-page recovery, errors/403, desktop/mobile')
