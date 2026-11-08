"""Run against Vite on :5173. API calls are mocked; no backend data changes."""
from playwright.sync_api import expect, sync_playwright

BASE = 'http://127.0.0.1:5173'
errors = []

article = {
    'id': 42,
    'source_type': 'SCHOOL',
    'title': '상시 모집 공지',
    'content': '<p>상시 모집합니다.</p>',
    'deadline_status': 'ALWAYS',
    'bookmark_count': 0,
    'is_bookmarked': False,
    'published_at': '2026-11-08T00:00:00Z',
    'vendors': [],
    'categories': [],
    'attachments': [],
    'summary_status': 'NONE',
}


def route_api(route):
    path = route.request.url.split('?')[0]
    if path.endswith('/api/v1/articles/42'):
        data = article
    elif path.endswith('/api/v1/articles'):
        data = {
            'content': [article],
            'page_info': {
                'current_page': 1, 'size': 10, 'total_pages': 1,
                'total_items': 1, 'has_next': False,
            },
        }
    else:
        data = []
    route.fulfill(json={'success': True, 'data': data})


with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    for width in (390, 1280):
        page = browser.new_page(viewport={'width': width, 'height': 844})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('https://api.inha-inform.today/**', route_api)
        page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',refreshToken:'fixture'},version:0}))")
        page.goto(BASE + '/events', wait_until='domcontentloaded')
        page.get_by_text('상시 모집 공지').click()
        expect(page).to_have_url(BASE + '/events/detail/42')
        expect(page.get_by_role('heading', name='상시 모집 공지')).to_be_visible()
        expect(page.get_by_text('진행중', exact=True)).to_have_count(0)
        page.wait_for_timeout(1200)
        expect(page).to_have_url(BASE + '/events/detail/42')
        page.close()
    assert not errors, errors
    browser.close()
