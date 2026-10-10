"""Notification integration checks using mocked API responses and fixture auth."""
import os
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in [375, 1280]:
        page = browser.new_page(viewport=dict(width=width, height=950))
        state = dict(list_fail=True, next_fail=True, read_fail=True,
                     article_fail=True, source='CLUB', hold=False, pending=[], calls=[])
        items = [dict(id=i, title=f'Notice {i}', message='Test notification',
                      type='DEADLINE_D1' if i == 1 else 'UNKNOWN', read=False,
                      created_at='2026-10-04T09:00:00+09:00',
                      **(dict(article_id=42) if i == 1 else {})) for i in [1, 2]]

        def api(route):
            path = urlparse(route.request.url).path
            state['calls'].append((route.request.method, path))
            if '/notifications' in path:
                assert route.request.headers.get('authorization') == 'Bearer fixture'
            if path == '/api/v1/notifications':
                number = int(parse_qs(urlparse(route.request.url).query)['page'][0])
                if state['list_fail'] or (number == 2 and state['next_fail']):
                    route.fulfill(status=500, json=dict(success=False))
                    return
                data = dict(content=[items[number - 1]], page_info=dict(
                    current_page=number, size=20, total_pages=2, total_items=2, has_next=number == 1))
            elif path == '/api/v1/notifications/unread-count':
                data = dict(unread_count=sum(not item['read'] for item in items))
            elif path.endswith('/read-all') or path.endswith('/read'):
                if state['read_fail']:
                    route.fulfill(status=500, json=dict(success=False))
                    return
                if state['hold']:
                    state['pending'].append(route)
                    return
                for item in items:
                    if path.endswith('/read-all') or path.endswith(f"/{item['id']}/read"):
                        item['read'] = True
                route.fulfill(json=dict(success=True))
                return
            elif path == '/api/v1/articles/42':
                if state['article_fail']:
                    route.fulfill(status=404, json=dict(success=False))
                    return
                data = dict(id=42, source_type=state['source'], title='Linked article',
                            content='Body', vendors=[], categories=[], attachments=[],
                            is_bookmarked=False, deadline_status='OPEN')
            else:
                data = []
            route.fulfill(json=dict(success=True, data=data))

        page.route('**/api/v1/**', api)
        page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{user_id:2,name:'Tester'}},version:0}))")
        page.goto(BASE)
        page.get_by_role('button').filter(has=page.get_by_role('img', name='알림', exact=True)).click()
        if width <= 430:
            expect(page.get_by_role('button', name='바텀시트 닫기')).to_have_count(1)
            expect(page.get_by_role('button', name='닫기', exact=True)).to_have_count(0)
        else:
            expect(page.get_by_role('button', name='바텀시트 닫기')).to_have_count(0)
            expect(page.get_by_role('button', name='닫기', exact=True)).to_have_count(1)
        expect(page.get_by_text('알림을 불러오지 못했습니다.', exact=True)).to_be_visible(timeout=15000)
        expect(page.get_by_text('알림이 없습니다', exact=True)).to_have_count(0)
        state['list_fail'] = False
        page.get_by_role('button', name='다시 시도').click()
        expect(page.get_by_text('Notice 1', exact=True)).to_be_visible()
        page.get_by_role('button', name='알림 더 보기').click()
        expect(page.get_by_text('다음 알림을 불러오지 못했습니다.')).to_be_visible(timeout=15000)
        expect(page.get_by_text('Notice 1', exact=True)).to_be_visible()
        state['next_fail'] = False
        page.get_by_role('button', name='다시 시도').click()
        expect(page.get_by_text('Notice 2', exact=True)).to_be_visible()
        expect(page.get_by_role('button', name='알림 더 보기')).to_have_count(0)
        page.get_by_text('Notice 1', exact=True).click()
        expect(page.get_by_text('읽음 처리에 실패했습니다. 다시 눌러 주세요.')).to_be_visible()
        assert urlparse(page.url).path == '/'
        page.get_by_role('button', name='모두 읽음').click()
        expect(page.get_by_text('읽음 처리에 실패했습니다. 다시 눌러 주세요.')).to_be_visible()
        state['read_fail'] = False
        page.get_by_text('Notice 2', exact=True).click()
        expect(page.get_by_text('처리 중입니다...')).to_have_count(0)
        assert items[1]['read']
        assert urlparse(page.url).path == '/'
        state['hold'] = True
        page.get_by_role('button', name='모두 읽음').click()
        expect(page.get_by_role('button', name='모두 읽음')).to_be_disabled()
        expect(page.get_by_role('button').filter(has=page.get_by_text('Notice 1', exact=True))).to_be_disabled()
        page.wait_for_timeout(100)
        assert len(state['pending']) == 1
        for item in items:
            item['read'] = True
        state['pending'].pop().fulfill(json=dict(success=True, data=dict(read_count=2)))
        state['hold'] = False
        expect(page.get_by_role('button', name='모두 읽음')).to_be_enabled()
        page.get_by_text('Notice 2', exact=True).click()
        expect(page.get_by_role('heading', name='알림', exact=True)).to_be_visible()
        page.get_by_text('Notice 1', exact=True).click()
        expect(page.get_by_text('삭제되었거나 볼 수 없는 게시글입니다.')).to_be_visible()
        state['article_fail'] = False
        page.get_by_text('Notice 1', exact=True).click()
        page.wait_for_url('**/clubs/detail/42')
        page.goto(BASE)
        state['source'] = 'SCHOOL'
        page.get_by_role('button').filter(has=page.get_by_role('img', name='알림', exact=True)).click()
        page.get_by_text('Notice 1', exact=True).click()
        page.wait_for_url('**/events/detail/42')
        page.goto(BASE)
        items[0]['read'] = False
        state['hold'] = True
        page.get_by_role('button').filter(has=page.get_by_role('img', name='알림', exact=True)).click()
        page.get_by_text('Notice 1', exact=True).click()
        expect(page.get_by_text('처리 중입니다...')).to_be_visible()
        page.get_by_role('button', name='바텀시트 닫기' if width <= 430 else '닫기', exact=True).click()
        assert len(state['pending']) == 1
        state['pending'].pop().fulfill(json=dict(success=True))
        page.wait_for_timeout(500)
        assert urlparse(page.url).path == '/', 'Closing during a request must prevent later navigation'
        page.close()
    browser.close()
print('PASS: mobile/desktop pagination, retries, read failures, duplicate protection, missing links and CLUB/SCHOOL routing')
