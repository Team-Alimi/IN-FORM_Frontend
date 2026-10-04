"""Run against Vite; all backend calls are intercepted, with no real writes."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
types = [dict(id=1, name='학술/IT'), dict(id=2, name='음악/공연')]
rows = [dict(id=1, name='기존 동아리', initial='fixture', type='CLUB',
             is_active=True, created_at='2026-01-01',
             club_types=[types[1], dict(id=9, name='이전 유형')])]
writes = []
type_error = False

def api(route):
    request = route.request
    path = urlparse(request.url).path
    if path == '/api/v1/club-types':
        if type_error:
            route.fulfill(status=500, json=dict(success=False))
        else:
            route.fulfill(json=dict(success=True, data=types))
        return
    assert path.startswith('/api/v1/admin/vendors'), path
    if request.method == 'GET':
        route.fulfill(json=dict(success=True, data=rows))
        return
    body = request.post_data_json
    writes.append((request.method, body))
    if request.method == 'POST':
        item = dict(body, id=2, is_active=True, created_at='2026-01-01', warning='등록 테스트 안내')
    else:
        item = dict(rows[0], **body)
    route.fulfill(json=dict(success=True, data=item))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1000))
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('**/api/v1/**', api)
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{user_id:2,role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/vendors')
    dialog = page.get_by_role('dialog')
    page.get_by_role('button', name='제공처/동아리 추가', exact=True).click()
    dialog.get_by_label('제공처 이름', exact=True).fill('테스트 동아리')
    dialog.get_by_label('식별자 (initial)', exact=True).fill('fixture-new')
    dialog.get_by_role('radio', name='CLUB (동아리)', exact=True).check()
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog.get_by_role('alert')).to_contain_text('하나 이상')
    assert not writes
    dialog.get_by_role('checkbox', name='학술/IT').check()
    dialog.get_by_role('checkbox', name='음악/공연').check()
    page.set_viewport_size(dict(width=375, height=812))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog).to_contain_text('등록 테스트 안내')
    assert writes[-1][1]['club_type_ids'] == [1, 2]
    dialog.get_by_role('button', name='확인', exact=True).click()

    # Switching back to SCHOOL must omit all club types.
    page.get_by_role('button', name='제공처/동아리 추가', exact=True).click()
    dialog.get_by_label('제공처 이름', exact=True).fill('테스트 기관')
    dialog.get_by_label('식별자 (initial)', exact=True).fill('fixture-school')
    dialog.get_by_role('radio', name='CLUB (동아리)', exact=True).check()
    dialog.get_by_role('checkbox', name='학술/IT').check()
    dialog.get_by_role('radio', name='SCHOOL (학과/기관)', exact=True).check()
    dialog.get_by_role('button', name='등록하기').click()
    expect(dialog).to_contain_text('등록 테스트 안내')
    assert 'club_type_ids' not in writes[-1][1]
    dialog.get_by_role('button', name='확인', exact=True).click()

    # An unchanged inactive association is preserved by omitting the field.
    page.get_by_role('button', name='기존 동아리 (#1) 수정').click()
    expect(dialog.get_by_role('checkbox', name='이전 유형 (비활성)')).to_be_checked()
    expect(dialog.get_by_role('checkbox', name='음악/공연')).to_be_checked()
    dialog.get_by_label('제공처 이름', exact=True).fill('이름만 변경')
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog).to_contain_text('변경사항을 저장했습니다.')
    assert writes[-1][1] == {'name': '이름만 변경'}
    dialog.get_by_role('button', name='확인', exact=True).click()

    page.get_by_role('button', name='기존 동아리 (#1) 수정').click()
    dialog.get_by_role('checkbox', name='학술/IT').check()
    before = len(writes)
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog.get_by_role('alert')).to_contain_text('비활성 유형을 해제')
    assert len(writes) == before
    dialog.get_by_role('checkbox', name='이전 유형 (비활성)').uncheck()
    dialog.get_by_role('button', name='변경사항 저장').click()
    expect(dialog).to_contain_text('변경사항을 저장했습니다.')
    assert writes[-1][1] == {'club_type_ids': [2, 1]}
    assert not errors, errors
    browser.close()
print('PASS: required selection, multi-select, SCHOOL omission, inactive preservation/replacement, mobile layout')
