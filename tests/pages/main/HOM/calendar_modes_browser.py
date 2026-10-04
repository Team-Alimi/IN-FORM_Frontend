"""HOM calendar modes with mocked APIs; run with Vite on TEST_BASE_URL."""
import os
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')

def article(id, date):
    return dict(id=id, title=f'Event {date}', source_type='SCHOOL', starts_on=date,
                ends_on=date, categories=[dict(id=1, name='학사')], deadline_status='OPEN')

def api(route):
    path = urlparse(route.request.url).path
    query = parse_qs(urlparse(route.request.url).query)
    if path == '/api/v1/calendar/articles':
        month = f"{query['year'][0]}-{int(query['month'][0]):02d}"
        data = [article(int(month.replace('-', '')) * 100 + day, f'{month}-{day:02d}') for day in [1, 14, 15, 28, 31]]
        # Fixture dates remain valid in every queried month.
        data = [a for a in data if not a['starts_on'].endswith('-31') or month.endswith(('-01','-03','-05','-07','-08','-10','-12'))]
    elif path == '/api/v1/categories':
        data = [dict(id=1, name='학사')]
    elif 'unread' in path:
        data = dict(unread_count=0)
    else:
        data = []
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in [320, 375, 1280]:
        page = browser.new_page(viewport=dict(width=width, height=1200), timezone_id='Asia/Seoul')
        page.clock.set_fixed_time(datetime(2026, 10, 14, 3, tzinfo=timezone.utc))
        page.route('**/api/v1/**', api)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE, wait_until='domcontentloaded')
        calendar = page.locator('[data-calendar-view]')
        events = page.locator('#event-list-section')
        expect(calendar).to_have_attribute('data-calendar-view', 'month')
        expect(page.locator('[data-calendar-week]')).to_have_count(5)
        expect(calendar.get_by_role('button', name='2026-10-14', exact=True).locator('div')).to_have_class(__import__('re').compile('bg-gray-200'))
        expect(events).to_contain_text('Event 2026-10-14')
        if width == 375:
            Path('tests/pages/main/HOM/screenshots').mkdir(exist_ok=True)
            page.screenshot(path='tests/pages/main/HOM/screenshots/month.png', full_page=True)
        month_height = calendar.bounding_box()['height']
        calendar.get_by_role('button', name='2026-10-15', exact=True).click()
        expect(calendar).to_have_attribute('data-calendar-view', 'week')
        expect(page.locator('[data-calendar-week]')).to_have_count(1)
        expect(calendar.get_by_role('button', name='2026-10-15', exact=True)).to_have_attribute('aria-pressed', 'true')
        expect(events).to_contain_text('Event 2026-10-15')
        expect(events).not_to_contain_text('Event 2026-10-14')
        page.wait_for_timeout(100)
        moving_height = calendar.bounding_box()['height']
        page.wait_for_timeout(250)
        week_height = calendar.bounding_box()['height']
        assert week_height < moving_height < month_height, (week_height, moving_height, month_height)
        assert calendar.locator('span.rounded-full').count() > 0
        if width in [375, 1280]:
            filename = 'week' if width == 375 else 'desktop-week'
            page.screenshot(path=f'tests/pages/main/HOM/screenshots/{filename}.png', full_page=True)
        handle = page.get_by_role('button', name='오늘의 월간 캘린더로 돌아가기')
        handle.scroll_into_view_if_needed()
        box = handle.bounding_box()
        x, y = box['x'] + box['width']/2, box['y'] + box['height']/2
        page.mouse.move(x,y)
        page.mouse.down()
        page.mouse.move(x,y+25,steps=3)
        page.mouse.up()
        expect(calendar).to_have_attribute('data-calendar-view', 'week')
        page.mouse.move(x,y)
        page.mouse.down()
        page.mouse.move(x,y+85,steps=5)
        page.mouse.up()
        expect(calendar).to_have_attribute('data-calendar-view', 'month')
        page.wait_for_timeout(100)
        expanding_height = calendar.bounding_box()['height']
        page.wait_for_timeout(250)
        assert week_height < expanding_height < calendar.bounding_box()['height']
        expect(events).to_contain_text('Event 2026-10-14')
        if width == 375:
            # A cancelled gesture must not expand; real touch drag must expand.
            calendar.get_by_role('button', name='2026-10-15', exact=True).click()
            page.wait_for_timeout(350)
            handle.scroll_into_view_if_needed()
            box = handle.bounding_box()
            page.mouse.move(box['x']+box['width']/2, box['y']+box['height']/2)
            page.mouse.down()
            handle.dispatch_event('pointercancel', dict(pointerId=1, clientY=200))
            page.mouse.up()
            expect(calendar).to_have_attribute('data-calendar-view', 'week')
            box = handle.bounding_box()
            client = page.context.new_cdp_session(page)
            point = dict(x=box['x']+box['width']/2, y=box['y']+box['height']/2)
            client.send('Input.dispatchTouchEvent', dict(type='touchStart', touchPoints=[point]))
            client.send('Input.dispatchTouchEvent', dict(type='touchMove', touchPoints=[dict(point, y=point['y']+85)]))
            client.send('Input.dispatchTouchEvent', dict(type='touchEnd', touchPoints=[]))
            expect(calendar).to_have_attribute('data-calendar-view', 'month')
        calendar.get_by_role('button', name='2026-10-31', exact=True).click()
        expect(calendar.get_by_role('button', name='2026-11-01', exact=True)).to_be_enabled()
        calendar.get_by_role('button', name='2026-11-01', exact=True).click()
        expect(events).to_contain_text('Event 2026-11-01')
        page.get_by_role('button', name='다음 주', exact=True).click()
        expect(calendar.get_by_role('button', name='2026-11-08', exact=True)).to_have_attribute('aria-pressed','true')
        handle.focus()
        page.keyboard.press('Enter')
        expect(calendar).to_have_attribute('data-calendar-view', 'month')
        expect(events).to_contain_text('Event 2026-10-14')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not errors, errors
        page.close()
    browser.close()
print('PASS: month/week, today/selected styles, daily events, short/full drag, month boundary, keyboard reset, mobile/desktop')
