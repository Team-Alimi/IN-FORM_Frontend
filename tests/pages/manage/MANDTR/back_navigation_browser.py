"""Run against local Vite :5173. All admin API responses are mocked."""
import os
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
errors = []


def row(number, status):
    return dict(
        id=number, title=f'테스트 공지 {number}', status=status,
        starts_on='2026-11-10', ends_on='2026-11-20',
        updated_at='2026-11-01T00:00:00Z',
        categories=[], vendors=[],
        previous_status='PUBLISHED' if status == 'TRASHED' else None,
    )


def route_api(route):
    request = route.request
    url = urlparse(request.url)
    path = url.path
    query = parse_qs(url.query)
    if path == '/api/v1/admin/articles/stats':
        data = dict(pending_review=16, ready_to_publish=16)
    elif path in ['/api/v1/admin/categories', '/api/v1/admin/vendors']:
        data = []
    elif path == '/api/v1/admin/articles/trash':
        data = dict(content=[row(n, 'TRASHED') for n in range(1, 17)], page_info=dict(current_page=1, size=50, total_pages=1, total_items=16, has_next=False))
    elif path.startswith('/api/v1/admin/articles/') and path.split('/')[-1].isdigit():
        number = int(path.split('/')[-1])
        data = dict(row(number, 'PENDING_REVIEW'), content='<p>본문</p>', source_type='SCHOOL', created_at='2026-11-01T00:00:00Z', attachments=[])
    elif path == '/api/v1/admin/articles':
        number = int(query.get('page', ['1'])[0])
        size = int(query.get('size', ['8'])[0])
        status = query.get('status', ['PENDING_REVIEW'])[0]
        data = dict(
            content=[row(n, status) for n in range((number - 1) * size + 1, min(number * size, 16) + 1)],
            page_info=dict(current_page=number, size=size, total_pages=(16 + size - 1) // size, total_items=16, has_next=number * size < 16),
        )
    else:
        raise AssertionError(f'Unexpected API request: {path}')
    route.fulfill(json=dict(success=True, data=data))


with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=900))
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',refreshToken:'fixture',userInfo:{user_id:1,name:'관리자',role:'ADMIN'}},version:0}))")

    for path, nav_name in [
        ('/manage', '게시글 페이지'),
        ('/manage/staged', '반영 대기 게시글 페이지'),
        ('/manage/unreviewed', '전체 미검수 게시글 페이지'),
        ('/manage/garbage', '휴지통 보관 게시물 페이지'),
    ]:
        page.goto(BASE + path)
        nav = page.get_by_role('navigation', name=nav_name)
        nav.get_by_role('button', name='다음 페이지').click()
        expect(nav.get_by_role('button', name='2', exact=True)).to_have_attribute('aria-current', 'page')
        item_number = 6 if path == '/manage/unreviewed' else 11
        page.get_by_role('link', name=f'테스트 공지 {item_number}', exact=True).first.click()
        expect(page.get_by_role('heading', name='게시글 상세 보기')).to_be_visible()
        page.get_by_role('button', name='뒤로 가기').click()
        expect(page.get_by_role('navigation', name=nav_name).get_by_role('button', name='2', exact=True)).to_have_attribute('aria-current', 'page')
        expect(page.get_by_role('link', name=f'테스트 공지 {item_number}', exact=True).first).to_be_visible()

        page.get_by_role('link', name=f'테스트 공지 {item_number}', exact=True).first.click()
        page.get_by_role('link', name='수정하기', exact=True).click()
        page.get_by_label('게시글 제목', exact=True).fill(f'수정한 테스트 공지 {item_number}')
        page.get_by_role('button', name='게시글 수정하기', exact=True).click()
        page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
        expect(page).to_have_url(BASE + path)
        expect(page.get_by_role('navigation', name=nav_name).get_by_role('button', name='2', exact=True)).to_have_attribute('aria-current', 'page')
        expect(page.get_by_role('link', name=f'테스트 공지 {item_number}', exact=True).first).to_be_visible()

    assert not errors, errors
    browser.close()
