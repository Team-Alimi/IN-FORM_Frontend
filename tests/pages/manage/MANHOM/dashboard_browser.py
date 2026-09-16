"""Run with python tests/pages/manage/MANHOM/dashboard_browser.py (Vite on :5173)."""
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests = []
errors = []
fail_list = False
rows = [dict(id=182+i, title=f'2026학년도 안내 게시글 {i+1}', status=['PUBLISHED', 'PENDING_REVIEW', 'READY_TO_PUBLISH', 'DRAFT'][i % 4], starts_on='2026-08-10', ends_on='2026-09-22', updated_at='2026-07-30T10:00:00+09:00', vendors=[dict(id=5, name='컴퓨터공학과')], categories=[dict(id=3, name='장학')]) for i in range(9)]
rows[1].pop('starts_on')
rows[1]['categories'] = []

def route_api(route):
    global rows
    req = route.request
    url = urlparse(req.url)
    query = parse_qs(url.query)
    requests.append((url.path, query, req.post_data_json if req.method == 'POST' else None))
    if url.path.endswith('/stats'):
        data = dict(pending_review=5, ready_to_publish=6)
    elif url.path.endswith('/categories'):
        data = [dict(id=3, name='장학')]
    elif url.path.endswith('/vendors'):
        data = [dict(id=5, name='컴퓨터공학과')]
    elif '/bulk/' in url.path:
        ids = req.post_data_json['ids']
        succeeded = ids[:1]
        data = dict(succeeded=succeeded, failed=[dict(id=i, code='CONCURRENT_MODIFICATION', message='다른 관리자가 수정했습니다.') for i in ids[1:]])
        if url.path.endswith('/trash'):
            rows = [r for r in rows if r['id'] not in succeeded]
    else:
        if fail_list:
            route.fulfill(status=403, json={'success': False, 'error': {'message': '권한이 없습니다.'}})
            return
        filtered = rows
        if 'status' in query: filtered = [r for r in filtered if r['status'] == query['status'][0]]
        if 'article_id' in query: filtered = [r for r in filtered if str(r['id']) == query['article_id'][0]]
        if 'keyword' in query: filtered = [r for r in filtered if query['keyword'][0] in r['title']]
        page = int(query.get('page', ['1'])[0]); size = int(query.get('size', ['8'])[0])
        total = 30 if 'needs_check' in query else len(filtered)
        data = dict(content=filtered[(page-1)*size:page*size], page_info=dict(current_page=page, size=size, total_pages=(total+size-1)//size, total_items=total, has_next=page*size<total))
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1320), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('dialog', lambda dialog: dialog.accept())
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'test',userInfo:{name:'관리자01'}},version:0}))")
    page.goto('http://127.0.0.1:5173/manage')
    expect(page.get_by_role('link', name='2026학년도 안내 게시글 1', exact=True)).to_be_visible()
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    expect(page.get_by_role('button', name='운영 반영', exact=True)).to_be_disabled()
    page.get_by_label('게시글 183 선택', exact=True).check()
    expect(page.get_by_role('button', name='운영 반영', exact=True)).to_be_disabled()
    page.get_by_label('게시글 183 선택', exact=True).uncheck()
    page.get_by_label('게시글 184 선택', exact=True).check()
    expect(page.get_by_role('button', name='운영 반영', exact=True)).to_be_enabled()
    page.get_by_role('button', name='운영 반영', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('1건 처리 완료')
    assert any(path.endswith('/bulk/publish') and body == {'ids':[184]} for path, _, body in requests)
    page.get_by_role('button', name='다음 페이지', exact=True).click()
    expect(page.get_by_role('link', name='2026학년도 안내 게시글 9', exact=True)).to_be_visible()
    page.get_by_role('button', name='확인 필요 게시글').click()
    expect(page.get_by_role('heading', name='확인 필요 게시글')).to_be_visible()
    page.get_by_role('button', name='초기화', exact=True).click()
    page.get_by_label('게시글 제목', exact=True).fill('없는 제목')
    page.get_by_role('button', name='조회', exact=True).click()
    expect(page.get_by_text('조회된 게시글이 없습니다.')).to_be_visible()
    page.get_by_role('button', name='초기화', exact=True).click()
    page.get_by_label('게시글 ID', exact=True).fill('182')
    page.get_by_label('출처', exact=True).select_option('5')
    page.get_by_label('카테고리', exact=True).select_option('3')
    page.get_by_label('행사 기간 시작일').fill('2026-08-01')
    page.get_by_label('행사 기간 종료일').fill('2026-09-30')
    page.get_by_role('button', name='조회', exact=True).click()
    expect(page.locator('tbody tr')).to_have_count(1)
    assert any(q.get('article_id') == ['182'] and q.get('vendor_id') == ['5'] and q.get('category_id') == ['3'] and q.get('starts_from') == ['2026-08-01'] for _, q, _ in requests)
    page.get_by_role('button', name='초기화', exact=True).click()
    page.get_by_label('게시글 182 선택', exact=True).check()
    page.get_by_label('게시글 183 선택', exact=True).check()
    page.get_by_role('button', name='삭제', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('#183: 다른 관리자가 수정했습니다.')
    expect(page.get_by_label('게시글 183 선택', exact=True)).to_be_checked()
    expect(page.get_by_label('게시글 182 선택', exact=True)).to_have_count(0)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'viewport overflow'
    fail_list = True
    page.get_by_role('button', name='조회', exact=True).click()
    page.reload()
    expect(page.get_by_text('게시글을 불러오지 못했습니다.')).to_be_visible(timeout=15000)
    fail_list = False
    page.get_by_role('button', name='다시 시도', exact=True).last.click()
    expect(page.locator('tbody tr')).to_have_count(8)
    assert not errors, errors
    browser.close()
print('PASS: desktop/mobile, filters, empty/error/retry, pagination, publish eligibility, JSON bulk payload, partial failure and selection')
