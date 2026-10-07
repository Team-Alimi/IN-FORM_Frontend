"""Mocked public announcement popups and admin lifecycle; no live writes."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright, expect

FORM = 'https://forms.gle/hTPpZsoi41kbyBC27'
with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in [375, 1280]:
        page = browser.new_page(viewport=dict(width=width, height=900))
        state = dict(items=[], popup_fail=False, write_fail=False, forbidden=False, writes=[])
        def api(route):
            path = route.request.url.split('?')[0]
            if path.endswith('/announcements/popup'):
                assert 'authorization' not in route.request.headers
                if state['popup_fail']:
                    route.fulfill(status=500, json=dict(success=False)); return
                data = [dict(id=1, type='EVENT', title='Coffee feedback', content='Share your feedback.\n' + FORM),
                        dict(id=2, type='GENERAL', title='Service notice', content='<b>Plain text only</b>')]
            elif '/admin/announcements' in path:
                method = route.request.method
                if state['forbidden']:
                    route.fulfill(status=403, json=dict(success=False, error=dict(message='관리자 권한이 필요합니다.'))); return
                if method != 'GET' and state['write_fail']:
                    route.fulfill(status=500, json=dict(success=False, error=dict(message='저장 실패 테스트'))); return
                if method == 'GET':
                    data = dict(content=state['items'], page_info=dict(current_page=1, total_pages=1, has_next=False))
                else:
                    payload = route.request.post_data_json if route.request.post_data else {}
                    state['writes'].append((method, path, payload))
                    if path.endswith('/publish'):
                        state['items'][0]['status'] = 'PUBLISHED'
                    elif path.endswith('/archive'):
                        state['items'][0]['status'] = 'ARCHIVED'
                    elif method == 'POST':
                        state['items'] = [dict(payload, id=10, warnings=['Fixture warning one', 'Fixture warning two'])]
                    else:
                        if payload.get('clear_period'):
                            state['items'][0].pop('starts_on', None)
                            state['items'][0].pop('ends_on', None)
                        state['items'][0].update(payload)
                    data = state['items'][0]
            elif path.endswith('/unread-count'): data = dict(unread_count=0)
            else: data = []
            route.fulfill(json=dict(success=True, data=data))
        page.route('**/api/v1/**', api)
        page.goto('http://127.0.0.1:5173')
        dialog = page.get_by_role('dialog')
        expect(dialog.get_by_role('heading', name='Coffee feedback')).to_be_visible()
        expect(dialog.get_by_role('link')).to_have_count(0)
        expect(dialog).not_to_contain_text(FORM)
        expect(dialog.locator('img')).to_have_js_property('naturalWidth', 600)
        assert dialog.bounding_box()['width'] <= width
        Path('tests/pages/main/HOM/screenshots').mkdir(parents=True, exist_ok=True)
        page.screenshot(path=f'tests/pages/main/HOM/screenshots/announcement-{width}.png')
        dialog.get_by_role('button', name='7일간 보지 않기').click()
        expect(dialog.get_by_role('heading', name='Service notice')).to_be_visible()
        expect(dialog.get_by_text('<b>Plain text only</b>', exact=True)).to_be_visible()
        expect(dialog.get_by_role('link', name='피드백 남기고 커피 받기')).to_have_count(0)
        if width <= 430:
            page.get_by_role('button', name='바텀시트 닫기', exact=True).click()
        else:
            page.keyboard.press('Escape')
        expect(dialog).to_have_count(0)
        page.reload()
        expect(dialog.get_by_role('heading', name='Service notice')).to_be_visible()
        expect(dialog.get_by_role('heading', name='Coffee feedback')).to_have_count(0)
        if width <= 430:
            page.get_by_role('button', name='바텀시트 닫기', exact=True).click()
        else:
            page.keyboard.press('Escape')
        page.evaluate("localStorage.setItem('inform-announcement-hidden-v1', JSON.stringify({'1':1,'2':1}))")
        page.reload()
        expect(dialog.get_by_role('heading', name='Coffee feedback')).to_be_visible()
        state['popup_fail'] = True
        page.reload()
        expect(page.locator('[data-calendar-view]')).to_be_visible()
        expect(dialog).to_have_count(0)
        page.evaluate("localStorage.setItem('auth-storage',JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{user_id:2,name:'Admin',role:'ADMIN'}},version:0}))")
        page.goto('http://127.0.0.1:5173/manage/announcements')
        page.get_by_role('button', name='공지 작성').click()
        page.get_by_role('textbox', name='제목', exact=True).fill('등록 테스트 공지')
        page.get_by_role('textbox', name='본문', exact=True).fill('피드백을 남겨주세요.\n' + FORM)
        expect(page.get_by_role('textbox', name='본문', exact=True)).to_have_value(re.compile(re.escape(FORM)))
        page.get_by_label('노출 시작일', exact=True).fill('2026-10-07')
        page.get_by_label('노출 종료일', exact=True).fill('2026-10-14')
        page.get_by_role('button', name='임시저장', exact=True).click()
        expect(page.get_by_text('Fixture warning one')).to_be_visible()
        expect(page.get_by_text('Fixture warning two')).to_be_visible()
        assert state['writes'][0][2]['status'] == 'DRAFT'
        page.get_by_role('button', name='수정', exact=True).click()
        page.get_by_label('노출 시작일', exact=True).fill('')
        page.get_by_label('노출 종료일', exact=True).fill('')
        page.get_by_role('button', name='수정 저장').click()
        expect(page.get_by_role('button', name='발행', exact=True)).to_be_visible()
        assert state['writes'][-1][2]['clear_period'] is True
        assert 'status' not in state['writes'][-1][2]
        page.on('dialog', lambda d: d.accept())
        state['write_fail'] = True
        page.get_by_role('button', name='발행', exact=True).click()
        expect(page.get_by_role('alert')).to_contain_text('저장 실패 테스트')
        assert state['items'][0]['status'] == 'DRAFT'
        state['write_fail'] = False
        page.get_by_role('button', name='발행', exact=True).click()
        expect(page.get_by_role('button', name='발행', exact=True)).to_have_count(0)
        page.get_by_role('button', name='보관', exact=True).click()
        expect(page.get_by_role('button', name='보관', exact=True)).to_have_count(0)
        expect(page.get_by_role('button', name='발행', exact=True)).to_be_visible()
        state['forbidden'] = True
        page.reload()
        expect(page.get_by_role('alert')).to_contain_text('관리자 권한이 필요합니다.')
        expect(page.get_by_role('button', name='공지 작성')).to_be_disabled()
        page.close()
    browser.close()
print('PASS: public popup, feedback CTA, sequence, plain text, suppression expiry, failure fallback, admin draft/update/publish/archive and warnings')
