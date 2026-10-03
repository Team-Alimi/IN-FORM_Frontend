"""Mock API checks for CBL thumbnails and CBL/CBD club type hashtags."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5174')
vendor = dict(id=91, name='테스트 동아리', type='CLUB', club_types=[dict(id=1, name='학술/IT'), dict(id=3, name='음악/공연')])
article = dict(id=2072, title='동아리 모집', source_type='CLUB', vendors=[vendor, vendor], categories=[dict(id=2, name='잘못된 카테고리')], thumbnail_url='https://fixture.test/poster.svg', content='모집 내용', attachments=[], deadline_status='OPEN', bookmark_count=0, view_count=0)
calls = []

def api(route):
    path = urlparse(route.request.url).path
    calls.append(path)
    if path == '/api/v1/articles':
        data = dict(content=[article, dict(article, id=2073, title='이미지 없음', thumbnail_url=None), dict(article, id=2074, title='이미지 오류', thumbnail_url='https://fixture.test/broken')], page_info=dict(current_page=1, total_pages=1, total_items=3))
    elif path == '/api/v1/articles/2072':
        data = article
    else:
        route.fulfill(status=404, json=dict(success=False))
        return
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in [375, 1280]:
        page = browser.new_page(viewport=dict(width=width, height=950))
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('**/api/v1/**', api)
        page.route('https://fixture.test/poster.svg', lambda r: r.fulfill(content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>'))
        page.route('https://fixture.test/broken', lambda r: r.fulfill(status=404))
        page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{user_id:2,role:'ADMIN'}},version:0}))")
        before = len(calls)
        page.goto(BASE + '/clubs')
        images = page.get_by_role('img', name='동아리 모집', exact=True)
        expect(images).to_have_count(2 if width == 375 else 1)
        for image in images.all():
            expect(image).to_have_js_property('naturalWidth', 100)
        expect(page.get_by_role('img', name='이미지 없음', exact=True)).to_have_count(0)
        expect(page.get_by_role('img', name='이미지 오류', exact=True)).to_have_count(0)
        expect(page.get_by_text('#잘못된 카테고리', exact=True)).to_have_count(0)
        if width == 375:
            expect(page.get_by_text('#학술/IT', exact=True)).to_have_count(3)
        assert '/api/v1/articles/2072' not in calls[before:]
        page.goto(BASE + '/clubs/detail/2072')
        expect(page.get_by_text('#학술/IT', exact=True)).to_have_count(1)
        expect(page.get_by_text('#음악/공연', exact=True)).to_have_count(1)
        expect(page.get_by_text('#테스트 동아리', exact=True)).to_have_count(0)
        expect(page.get_by_text('#잘못된 카테고리', exact=True)).to_have_count(0)
        assert not errors, errors
        page.close()
    browser.close()
print('PASS: mobile/desktop thumbnails, missing/broken images, deduplicated type hashtags, no detail prefetch')
