"""Vite on :5173; run with Python + Playwright. All API calls use local fixtures."""
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests = []
errors = []
mode = 'normal'
partial = False
entries = [
    (183, '2026년 1학기 수강정정 기간 안내', '학사'),
    (186, '교내 성적 우수 장학금 신청 안내', '장학금'),
    (188, '글로벌 SW 공모전 참가팀 모집', '공모전·대회'),
    (191, '2026년 전과 신청 안내', '학사'),
    (194, '대학생 사회혁신 아이디어 공모전 참가 모집', '공모전·대회'),
    (195, '2026년 추가 장학금 안내', '장학금'),
    (196, '국제 교류 설명회', '학사'),
]
rows = [dict(id=i, title=title, status='PENDING_REVIEW', starts_on='2026-02-15', ends_on='2026-02-28', updated_at='2026-02-10T10:00:00+09:00', categories=[dict(id=1, name=category)], vendors=[dict(id=5, name='학사지원팀')]) for i, title, category in entries]
flagged = {183, 186, 188, 191, 194, 195}
# Non-pending data must never leak into either list.
rows.append(dict(rows[0], id=200, status='PUBLISHED'))

def route_api(route):
    req = route.request
    path = urlparse(req.url).path
    params = parse_qs(urlparse(req.url).query)
    body = req.post_data_json if req.method == 'POST' else None
    requests.append((path, params, body))
    if mode == 'forbidden':
        route.fulfill(status=403, json=dict(success=False, error=dict(code='FORBIDDEN', message='권한이 없습니다.')))
        return
    if path.endswith('/stats'):
        data = dict(pending_review=sum(r['status']=='PENDING_REVIEW' for r in rows), ready_to_publish=2)
    elif path.endswith('/vendors'):
        data = [dict(id=5, name='학사지원팀')]
    elif path.endswith('/categories'):
        data = [dict(id=1, name='학사')]
    elif '/bulk/' in path:
        if mode == 'mutation-error':
            route.fulfill(status=500, json=dict(success=False, error=dict(message='잠시 후 다시 시도해 주세요.')))
            return
        assert body and body['ids']
        assert path.endswith('/status') or path.endswith('/trash')
        if path.endswith('/status'): assert body['status'] == 'READY_TO_PUBLISH'
        succeeded = body['ids'][:1] if partial else body['ids']
        data = dict(succeeded=succeeded, failed=[dict(id=i, code='CONCURRENT_MODIFICATION', message='다른 관리자가 수정했습니다.') for i in body['ids'] if i not in succeeded])
        for row in rows:
            if row['id'] in succeeded: row['status'] = 'TRASHED' if path.endswith('/trash') else 'READY_TO_PUBLISH'
    else:
        assert params.get('status') == ['PENDING_REVIEW'], params
        if mode == 'list-error' and params.get('needs_check') == ['true']:
            route.fulfill(status=500, json=dict(success=False, error=dict(message='서버 오류')))
            return
        filtered = [r for r in rows if r['status'] == 'PENDING_REVIEW']
        if params.get('needs_check') == ['true']: filtered = [r for r in filtered if r['id'] in flagged]
        if params.get('article_id'): filtered = [r for r in filtered if str(r['id']) == params['article_id'][0]]
        if params.get('keyword'): filtered = [r for r in filtered if params['keyword'][0] in r['title']]
        page = int(params['page'][0]); size = int(params['size'][0]); count = len(filtered)
        data = dict(content=filtered[(page-1)*size:page*size], page_info=dict(current_page=page, size=size, total_items=count, total_pages=(count+size-1)//size, has_next=page*size<count))
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1580), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{name:'관리자01',role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/unreviewed')
    checks = page.get_by_role('region', name='확인 필요 게시글', exact=True)
    all_rows = page.get_by_role('region', name='전체 미검수 게시글', exact=True)
    search = page.get_by_role('form', name='미검수 게시글 검색')
    expect(checks.locator('tbody tr')).to_have_count(5)
    expect(all_rows.locator('tbody tr')).to_have_count(5)
    expect(page.get_by_role('heading', name='미검수 게시글 (7)', exact=True)).to_be_visible()
    expect(checks.get_by_role('button', name='반영대기', exact=True)).to_be_disabled()
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1580))
    checks.get_by_label('게시글 183 선택', exact=True).check()
    expect(all_rows.get_by_label('게시글 183 선택', exact=True)).not_to_be_checked()
    checks.get_by_role('button', name='다음 페이지').click()
    expect(checks.get_by_label('게시글 195 선택', exact=True)).to_be_visible()
    expect(checks.get_by_role('button', name='반영대기', exact=True)).to_be_disabled()
    expect(all_rows.get_by_label('게시글 183 선택', exact=True)).to_be_visible()
    checks.get_by_role('button', name='이전 페이지').click()
    search.get_by_label('게시글 제목', exact=True).fill('없는 제목')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(all_rows.get_by_text('조회된 게시글이 없습니다.')).to_be_visible()
    expect(checks.locator('tbody tr')).to_have_count(5)
    search.get_by_role('button', name='초기화', exact=True).click()
    expect(all_rows.locator('tbody tr')).to_have_count(5)
    search.get_by_label('게시글 ID', exact=True).fill('183')
    search.get_by_label('출처', exact=True).select_option('5')
    search.get_by_label('카테고리', exact=True).select_option('1')
    search.get_by_label('행사 기간 시작일').fill('2026-02-01')
    search.get_by_label('행사 기간 종료일').fill('2026-03-01')
    search.get_by_role('button', name='조회', exact=True).click()
    expect(all_rows.locator('tbody tr')).to_have_count(1)
    assert any(q.get('article_id') == ['183'] and q.get('vendor_id') == ['5'] and q.get('category_id') == ['1'] and q.get('starts_from') == ['2026-02-01'] and q.get('ends_to') == ['2026-03-01'] and 'needs_check' not in q for _, q, _ in requests)
    search.get_by_label('행사 기간 시작일').fill('2026-04-01')
    before = len(requests)
    search.get_by_role('button', name='조회', exact=True).click()
    expect(search.get_by_role('alert')).to_contain_text('종료일')
    assert len(requests) == before
    search.get_by_role('button', name='초기화', exact=True).click()
    # Escape must cancel without any write request.
    checks.get_by_label('게시글 183 선택', exact=True).check()
    checks.get_by_role('button', name='반영대기', exact=True).click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    assert not any(body for _, _, body in requests)
    # One bulk success, one conflict; synchronize both lists and clear the other list selection.
    checks.get_by_label('게시글 186 선택', exact=True).check()
    all_rows.get_by_label('게시글 183 선택', exact=True).check()
    partial = True
    checks.get_by_role('button', name='반영대기', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('1건 반영대기로 이동 완료 · 1건 실패')
    expect(page.get_by_role('status')).to_contain_text('#186: 다른 관리자가 수정했습니다.')
    expect(checks.get_by_label('게시글 183 선택', exact=True)).to_have_count(0)
    expect(all_rows.get_by_label('게시글 183 선택', exact=True)).to_have_count(0)
    expect(checks.get_by_label('게시글 186 선택', exact=True)).to_be_checked()
    expect(all_rows.get_by_label('게시글 186 선택', exact=True)).not_to_be_checked()
    expect(page.get_by_role('heading', name='미검수 게시글 (6)', exact=True)).to_be_visible()
    assert any(path.endswith('/bulk/status') and body == {'ids':[183,186], 'status':'READY_TO_PUBLISH'} for path, _, body in requests)
    # Last-page deletion returns to a populated page.
    partial = False
    all_rows.get_by_role('button', name='다음 페이지').click()
    expect(all_rows.get_by_label('게시글 196 선택', exact=True)).to_be_visible()
    all_rows.get_by_label('게시글 196 선택', exact=True).check()
    all_rows.get_by_role('button', name='삭제', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('1건 휴지통으로 이동 완료')
    expect(all_rows.locator('tbody tr')).to_have_count(5)
    assert any(path.endswith('/bulk/trash') and body == {'ids':[196]} for path, _, body in requests)
    # A failed mutation keeps selection and exposes the server error.
    mode = 'mutation-error'
    all_rows.get_by_label('게시글 186 선택', exact=True).check()
    all_rows.get_by_role('button', name='반영대기', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('잠시 후 다시 시도')
    expect(all_rows.get_by_label('게시글 186 선택', exact=True)).to_be_checked()
    # Isolated query error and retry leave the lower list usable.
    mode = 'list-error'
    page.reload()
    expect(checks.get_by_role('alert')).to_contain_text('게시글을 불러오지 못했습니다.', timeout=15000)
    expect(all_rows.locator('tbody tr')).to_have_count(5)
    mode = 'normal'
    checks.get_by_role('button', name='다시 시도').click()
    expect(checks.locator('tbody tr')).to_have_count(5)
    # Forbidden is terminal: no repeated queries and return path targets this page.
    mode = 'forbidden'
    requests.clear()
    page.reload()
    expect(page.get_by_role('heading', name='관리자 접근 권한을 확인해 주세요')).to_be_visible()
    page.wait_for_timeout(8000)
    assert len(requests) <= 5, requests
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE + '/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/unreviewed'
    assert not errors, errors
    browser.close()
print('PASS: MANURV independent lists/pagination, search/date validation, confirm/cancel, partial success, cache sync, trash/last page, failures/retry/403, desktop/mobile')
