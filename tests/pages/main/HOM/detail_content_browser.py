"""Home detail sheet: date, safe HTML, inline/attached images and plain text."""
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=390, height=844), timezone_id='Asia/Seoul')
    page.clock.set_fixed_time(datetime(2026, 10, 14, 3, tzinfo=timezone.utc))
    article = dict(id=42, title='Fixture article', source_type='CLUB',
                   starts_on='2026-10-14', ends_on='2026-10-14', published_at='2026-10-02T00:00:00Z',
                   vendors=[], categories=[], deadline_status='OPEN', is_bookmarked=False, bookmark_count=0,
                   content='<p>Recruiting members</p><img src="https://fixture.test/inline.png" alt="Inline image" onerror="window.unsafe=true"><script>window.unsafe=true</script>',
                   attachments=[dict(file_url='https://fixture.test/inline.png', original_name='Duplicate'),
                                dict(file_url='https://fixture.test/attached.png', original_name='Attached image'),
                                dict(file_url='https://fixture.test/file.pdf', original_name='Attachment PDF')])

    def api(route):
        path = urlparse(route.request.url).path
        if path == '/api/v1/calendar/articles': data = [article]
        elif path == '/api/v1/articles/42': data = article
        elif path.endswith('/unread-count'): data = dict(unread_count=0)
        else: data = []
        route.fulfill(json=dict(success=True, data=data))

    page.route('**/api/v1/**', api)
    page.route('https://fixture.test/**', lambda r: r.fulfill(content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><rect width="1200" height="500" fill="blue"/></svg>'))
    page.add_init_script("localStorage.setItem('auth-storage',JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{user_id:2,name:'Tester'}},version:0}))")
    page.goto('http://127.0.0.1:5173')
    page.locator('#event-list-section').get_by_text('Fixture article', exact=True).click()
    sheet = page.locator('[data-bottom-sheet]')
    expect(sheet.get_by_text('2026-10-02', exact=True)).to_be_visible()
    expect(sheet).not_to_contain_text('T00:00:00Z')
    expect(sheet.get_by_text('Recruiting members', exact=True)).to_be_visible()
    expect(sheet.locator('[data-article-body] img')).to_have_count(2)
    expect(sheet.get_by_role('link', name='Attachment PDF')).to_have_count(1)
    expect(sheet.locator('[data-article-body] script, [data-article-body] [onerror]')).to_have_count(0)
    assert page.evaluate('window.unsafe') is None
    image = sheet.get_by_role('img', name='Inline image')
    expect(image).to_have_js_property('naturalWidth', 1200)
    assert image.bounding_box()['width'] < 390
    Path('tests/pages/main/HOM/screenshots').mkdir(parents=True, exist_ok=True)
    page.screenshot(path='tests/pages/main/HOM/screenshots/detail-sheet.png')
    page.get_by_role('button', name='바텀시트 닫기').click()
    article.update(source_type='SCHOOL', content='First line\n\nSecond line', attachments=[])
    page.reload()
    page.locator('#event-list-section').get_by_text('Fixture article', exact=True).click()
    plain = sheet.locator('[data-article-body] > div')
    expect(plain).to_have_text('First line\n\nSecond line')
    assert plain.evaluate('el => getComputedStyle(el).whiteSpace') == 'pre-wrap'
    browser.close()
print('PASS: HOM date, safe HTML, images without duplication, attachments and plain-text line breaks')
