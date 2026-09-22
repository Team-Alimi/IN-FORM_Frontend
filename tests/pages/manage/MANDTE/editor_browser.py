"""Run with Vite on :5173 and Python Playwright. All backend writes are mocked."""
import base64
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests, errors, held = [], [], []
mode = 'normal'
upload_number = 0
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jPZkAAAAASUVORK5CYII=')
detail = dict(id=42, source_type='SCHOOL', status='READY_TO_PUBLISH', title='기존 게시글', content='<p>기존 본문</p>', starts_on='2026-10-01', ends_on='2026-10-10', categories=[dict(id=3, name='장학'), dict(id=9, name='숨김 카테고리')], vendors=[dict(id=88, vendor_id=5, vendor_name='학사지원팀', source_url='https://inha.ac.kr/crawled', external_key='123'), dict(id=89, vendor_id=5, vendor_name='학사지원팀', source_url='https://inha.ac.kr/manual')], attachments=[dict(id=77, file_url='https://fixture.test/existing.png', original_name='기존.png', content_type='image/png', size_bytes=100)])

def route_api(route):
    global upload_number
    req = route.request
    path = urlparse(req.url).path
    query = parse_qs(urlparse(req.url).query)
    is_json = 'application/json' in req.headers.get('content-type', '')
    body = req.post_data_json if is_json else None
    requests.append((req.method, path, query, body))
    if mode == 'forbidden' or (mode == 'id-error' and path.endswith('/123')):
        route.fulfill(status=403, json=dict(success=False, error=dict(code='FORBIDDEN', message='권한이 없습니다.')))
        return
    if path.endswith('/categories'):
        data = [dict(id=i, name=name, is_active=i != 9) for i, name in [(1, '대회/공모전'), (3, '장학'), (4, '대외활동'), (7, '특강'), (9, '숨김 카테고리')]]
    elif path.endswith('/vendors'):
        source = query.get('type', ['SCHOOL'])[0]
        data = [dict(id=5 if source == 'SCHOOL' else 21, name='학사지원팀' if source == 'SCHOOL' else '동아리연합회', type=source, is_active=True)]
    elif path.endswith('/duplicate-check'):
        assert query.get('title') and 'article_id' not in query and 'external_key' not in query
        data = dict(exists=True, articles=[dict(id=42, title='장학금 공지', status='TRASHED')])
    elif path.endswith('/files') and req.method == 'POST':
        assert 'multipart/form-data; boundary=' in req.headers['content-type']
        assert b'name="files"' in req.post_data_buffer
        assert b'name="file"' not in req.post_data_buffer
        upload_number += 1
        data = [dict(file_url=f'https://fixture.test/new-{upload_number}.png', original_name='poster.png', content_type='image/png', size_bytes=len(PNG))]
        if mode == 'hold-upload':
            held.append((route, data)); return
    elif path.endswith('/files') and req.method == 'DELETE':
        assert set(body) == {'file_urls'} and body['file_urls'] and 'https://fixture.test/existing.png' not in body['file_urls']
        if mode == 'cleanup-error':
            route.fulfill(status=500, json=dict(success=False, error=dict(message='정리 실패'))); return
        data = dict(deleted=len(body['file_urls']))
    elif req.method in ['POST', 'PATCH'] and '/articles' in path:
        assert body and 'admin_status' not in body and 'storage_type' not in str(body)
        if mode == 'save-error':
            route.fulfill(status=409, json=dict(success=False, error=dict(code='DUPLICATE_RESOURCE', message='이미 존재하는 값입니다.'))); return
        data = dict(id=512)
        if mode == 'hold-save':
            held.append((route, data)); return
    elif path.endswith('/42'):
        data = detail
    elif path.endswith('/123'):
        route.fulfill(status=404, json=dict(success=False, error=dict(code='ARTICLE_NOT_FOUND', message='존재하지 않는 공지입니다.'))); return
    elif path.endswith('/stats'):
        data = dict(pending_review=0, ready_to_publish=0)
    else:
        data = dict(content=[], page_info=dict(current_page=1, size=8, total_items=0, total_pages=0, has_next=False))
    route.fulfill(status=201 if req.method == 'POST' and path.endswith('/articles') else 200, json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1140), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('dialog', lambda dialog: dialog.accept())
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('https://fixture.test/**', lambda route: route.fulfill(content_type='image/png', body=PNG))
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{name:'관리자01',role:'ADMIN'}},version:0}))")
    page.goto(BASE + '/manage/edit')
    editor = page.get_by_role('textbox', name='게시글 본문', exact=True)
    submit = page.get_by_role('button', name='게시글 등록하기', exact=True)
    expect(editor).to_be_visible()
    expect(page.get_by_label('게시글 제목', exact=True)).to_have_value('')
    expect(page.get_by_label('숨김 카테고리', exact=True)).to_have_count(0)
    expect(page.get_by_label('미검수', exact=True)).to_be_checked()
    page.evaluate('document.fonts.ready')
    page.add_style_tag(content='.tsqd-parent-container { display: none !important; }')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size(dict(width=1280, height=1140))
    submit.click()
    expect(page.get_by_role('alert')).to_contain_text('제목')
    page.get_by_label('게시글 제목', exact=True).fill('장학금 공지')
    submit.click()
    expect(page.get_by_role('alert')).to_contain_text('본문')
    editor.fill('실제 편집한 본문')
    page.get_by_label('게시글 ID', exact=True).fill('42')
    page.get_by_role('button', name='중복 확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('이미 사용 중인 ID')
    page.get_by_label('게시글 ID', exact=True).fill('123')
    expect(page.get_by_text('이미 사용 중인 ID입니다.', exact=True)).to_have_count(0)
    page.get_by_role('button', name='중복 확인', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('확인 시점에 사용하지 않는 ID')
    page.get_by_role('button', name='유사 제목 확인').click()
    expect(page.get_by_text('· 휴지통', exact=False)).to_be_visible()
    page.get_by_label('게시글 제목', exact=True).fill('새 제목')
    expect(page.get_by_role('link', name='#42 장학금 공지')).to_have_count(0)
    page.get_by_label('장학', exact=True).check()
    page.get_by_label('대외활동', exact=True).check()
    page.get_by_label('행사 시작일').fill('2026-11-02')
    page.get_by_label('행사 마감일').fill('2026-11-01')
    submit.click()
    expect(page.get_by_role('alert')).to_contain_text('시작일')
    page.get_by_label('행사 마감일').fill('2026-11-10')
    page.get_by_role('button', name='출처 추가', exact=True).click()
    page.get_by_label('제공처', exact=True).select_option('5')
    page.get_by_label('원본 URL (선택)', exact=True).fill('https://inha.ac.kr/notice')
    page.get_by_role('dialog').get_by_role('button', name='추가', exact=True).click()
    expect(page.get_by_label('동아리', exact=True)).to_be_disabled()
    # Every upload uses the multipart files part and server metadata.
    page.get_by_label('본문 이미지 파일').set_input_files(dict(name='wrong.pdf', mimeType='application/pdf', buffer=b'bad'))
    expect(page.get_by_role('alert')).to_contain_text('이미지만')
    mode = 'hold-upload'
    page.get_by_label('본문 이미지 파일').set_input_files(dict(name='poster.png', mimeType='image/png', buffer=PNG))
    expect(page.get_by_role('status').filter(has_text='업로드 중')).to_be_visible()
    expect(submit).to_be_disabled()
    route, data = held.pop(); route.fulfill(json=dict(success=True, data=data)); mode = 'normal'
    expect(editor.locator('img')).to_have_count(1)
    expect(page.get_by_role('region', name='첨부 이미지')).to_contain_text('poster.png')
    # Cleanup failure preserves the attachment; successful removal cannot be undone to a dead URL.
    mode = 'cleanup-error'
    page.get_by_label('첨부 1 제거').click()
    expect(page.get_by_role('alert')).to_contain_text('이미지 제거 요청에 실패')
    expect(editor.locator('img')).to_have_count(1)
    mode = 'normal'
    page.get_by_label('첨부 1 제거').click()
    expect(editor.locator('img')).to_have_count(0)
    page.get_by_role('button', name='실행 취소', exact=True).click()
    expect(editor.locator('img')).to_have_count(0)
    page.get_by_label('본문 이미지 파일').set_input_files(dict(name='poster.png', mimeType='image/png', buffer=PNG))
    expect(editor.locator('img')).to_have_count(1)
    page.get_by_label('운영', exact=True).check()
    submit.click()
    expect(page.get_by_role('dialog')).to_contain_text('사용자에게 게시글이 공개됩니다.')
    page.get_by_role('button', name='계속 작성', exact=True).click()
    assert not any(method == 'POST' and path.endswith('/articles') for method, path, _, _ in requests)
    mode = 'save-error'
    submit.click(); page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('이미 존재하는 값')
    expect(page.get_by_label('게시글 제목', exact=True)).to_have_value('새 제목')
    expect(editor).to_contain_text('실제 편집한 본문')
    body = [body for method, path, _, body in requests if method == 'POST' and path.endswith('/articles')][-1]
    assert body['article_id'] == 123 and body['status'] == 'PUBLISHED' and body['source_type'] == 'SCHOOL'
    assert body['category_ids'] == [3, 4] and body['starts_on'] == '2026-11-02'
    assert body['vendors'] == [dict(vendor_id=5, source_url='https://inha.ac.kr/notice')]
    assert body['attachments'][0]['size_bytes'] == len(PNG) and 'id' not in body['attachments'][0]
    assert 'data:image' not in body['content'] and 'new-2.png' in body['content']
    mode = 'hold-save'
    submit.click(); page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page.get_by_role('button', name='처리 중…', exact=True)).to_be_disabled()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_be_visible()
    route, data = held.pop(); mode = 'normal'; route.fulfill(status=201, json=dict(success=True, data=data))
    expect(page).to_have_url(BASE+'/manage')
    # CLUB defaults to DRAFT and automatically issued IDs are omitted.
    page.goto(BASE+'/manage/edit')
    page.get_by_label('동아리', exact=True).check()
    expect(page.get_by_label('임시저장', exact=True)).to_be_checked()
    expect(page.get_by_label('미검수', exact=True)).to_have_count(0)
    page.get_by_label('게시글 제목', exact=True).fill('동아리 모집')
    editor.fill('모집 본문')
    editor.press('Control+a')
    page.get_by_role('button', name='굵게', exact=True).click()
    expect(editor.locator('strong')).to_contain_text('모집 본문')
    page.get_by_role('button', name='링크', exact=True).click()
    page.get_by_label('링크 주소', exact=True).fill('https://inha.ac.kr/join')
    page.get_by_role('dialog').get_by_role('button', name='적용', exact=True).click()
    expect(editor.locator('a')).to_have_attribute('href', 'https://inha.ac.kr/join')
    editor.press('Control+End')
    page.get_by_role('button', name='표 추가', exact=True).click()
    expect(editor.locator('table')).to_have_count(1)
    page.get_by_role('button', name='표 삭제', exact=True).click()
    expect(editor.locator('table')).to_have_count(0)
    page.get_by_role('button', name='출처 추가', exact=True).click()
    page.get_by_label('제공처', exact=True).select_option('21')
    page.get_by_role('dialog').get_by_role('button', name='추가', exact=True).click()
    submit.click(); page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page).to_have_url(BASE+'/manage')
    body = [body for method, path, _, body in requests if method == 'POST' and path.endswith('/articles')][-1]
    assert body['source_type'] == 'CLUB' and body['status'] == 'DRAFT' and 'article_id' not in body
    assert body['vendors'] == [dict(vendor_id=21)] and 'starts_on' not in body and 'ends_on' not in body
    # Edit preserves relation IDs, locks crawled vendors and sends no ignored state fields.
    page.goto(BASE+'/manage/edit/42')
    expect(page.get_by_label('게시글 제목', exact=True)).to_have_value('기존 게시글')
    expect(page.get_by_label('게시글 ID', exact=True)).to_be_disabled()
    expect(page.get_by_text('수집 출처', exact=True)).to_be_visible()
    expect(page.get_by_label('학사지원팀 출처 제거 1')).to_have_count(0)
    page.get_by_label('행사 시작일').fill('')
    page.get_by_role('button', name='게시글 수정하기', exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('기존 행사 날짜는 비울 수 없습니다')
    page.get_by_label('행사 시작일').fill('2026-10-02')
    page.get_by_label('게시글 제목', exact=True).fill('수정한 제목')
    editor.fill('수정한 실제 본문')
    page.get_by_role('button', name='게시글 수정하기', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page).to_have_url(BASE+'/manage')
    body = [body for method, path, _, body in requests if method == 'PATCH'][-1]
    assert not {'source_type', 'status', 'article_id'} & set(body)
    assert body['vendors'][0]['id'] == 88 and body['vendors'][1]['id'] == 89 and body['attachments'][0]['id'] == 77
    assert body['category_ids'] == [3, 9] and '수정한 실제 본문' in body['content']
    # Cancel and navigation clean only newly uploaded files.
    page.goto(BASE+'/manage/edit/42')
    expect(editor).to_be_visible()
    page.get_by_label('본문 이미지 파일').set_input_files(dict(name='poster.png', mimeType='image/png', buffer=PNG))
    expect(page.get_by_role('region', name='첨부 이미지')).to_contain_text('(2/20)')
    page.get_by_role('link', name='홈', exact=True).click()
    expect(page.get_by_role('dialog')).to_contain_text('작성을 취소할까요?')
    page.get_by_role('button', name='계속 작성', exact=True).click()
    expect(page).to_have_url(BASE+'/manage/edit/42')
    page.get_by_role('button', name='취소', exact=True).click()
    page.get_by_role('dialog').get_by_role('button', name='확인', exact=True).click()
    expect(page).to_have_url(BASE+'/manage')
    assert [body for method, path, _, body in requests if method == 'DELETE'][-1]['file_urls'] == ['https://fixture.test/new-3.png']
    mode = 'forbidden'
    page.goto(BASE+'/manage/edit')
    expect(page.get_by_role('alert').filter(has_text='관리자 접근 권한')).to_be_visible()
    expect(submit).to_be_disabled()
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE+'/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/edit'
    assert not errors, errors
    browser.close()
print('PASS: MANDTE create/edit payloads, optional ID, duplicate checks, category/source/status rules, real editor HTML, upload/remove/cancel, failure preservation, pending lock, 403, desktop/mobile')
