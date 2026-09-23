"""Vite on :5173; Python Playwright. All API responses are mocked; no server writes."""
import base64
import copy
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
OUTPUT = Path(__file__).parent / 'screenshots'
OUTPUT.mkdir(exist_ok=True)
requests, errors, held = [], [], []
mode = 'normal'
CONTENT = '''<h2>2026학년도 1학기 수강신청 및 유의사항 안내</h2><hr>
<h3>■ 수강신청 일정</h3>
<p>· 재학생 수강신청: <strong>2026.08.10(월) 09:00 ~ 2026.08.12(수) 17:00</strong></p>
<p>· 수강신청 확인 및 정정: <strong>2026.08.22(금) 09:00 ~ 2026.08.24(일) 17:00</strong></p>
<p>· 수강신청 결과 발표: <strong>2026.08.25(월) 09:00</strong></p>
<p>· 최종 수강 확정: <strong>2026.09.01(월) 이후</strong></p>
<h3>■ 수강신청 방법</h3>
<p>· 학교 포털(portal.inha.ac.kr) → 학사정보 → 수강신청 메뉴 이용</p>
<p>· 수강신청 시스템 접속 후 원하는 강의를 장바구니에 담아 신청하세요.</p>
<p>· 모바일 앱을 통한 신청도 가능합니다 (iOS / Android 지원).</p>
<h3>■ 수강신청 유의사항</h3>
<ul><li>졸업 요건에 해당하는 전공필수 과목을 우선적으로 확인하세요.</li>
<li>시간표 중복 여부를 사전에 반드시 확인하세요.</li>
<li>정원 초과 강의는 대기 순번제로 운영됩니다.</li>
<li>동일 학점을 이중 등록하지 않도록 유의하세요.</li></ul>
<h3>■ 문의처</h3><p>· 학사지원팀: 032-860-7000</p>
<p>· 이메일: academic@inha.ac.kr</p><p>· 운영시간: 평일 09:00 ~ 17:00 (점심 12:00 ~ 13:00 제외)</p>'''
original = dict(id=182, source_type='SCHOOL', status='PUBLISHED', title='2026학년도 1학기 수강신청 및 유의사항 안내', content=CONTENT, starts_on='2026-08-10', ends_on='2026-09-22', updated_at='2026-07-30T03:00:10Z', created_at='2026-07-01T10:00:00+09:00', categories=[dict(id=1, name='특강·세미나')], vendors=[dict(id=88, vendor_id=5, vendor_name='산업경영공학과', source_url='https://inha.ac.kr/original', external_key='123'), dict(id=89, vendor_id=6, vendor_name='컴퓨터공학과')], attachments=[])
article = copy.deepcopy(original)
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jPZkAAAAASUVORK5CYII=')

def route_api(route):
    req = route.request
    path = urlparse(req.url).path
    query = parse_qs(urlparse(req.url).query)
    requests.append((req.method, path, query))
    assert req.method == 'GET', (req.method, path)
    if path.endswith('/182'):
        assert not query
        if mode == 'hold':
            held.append(route); return
        if mode in ['forbidden', 'not-found', 'server-error']:
            status, code = {'forbidden': (403, 'FORBIDDEN'), 'not-found': (404, 'ARTICLE_NOT_FOUND'), 'server-error': (500, 'INTERNAL_SERVER_ERROR')}[mode]
            route.fulfill(status=status, json=dict(success=False, error=dict(code=code, message='fixture error'))); return
        data = article
    elif path.endswith('/stats'):
        data = dict(pending_review=1, ready_to_publish=0)
    elif path.endswith('/categories'):
        data = [dict(id=1, name='특강·세미나', is_active=True)]
    elif path.endswith('/vendors'):
        data = [dict(id=5, name='산업경영공학과', type='SCHOOL', is_active=True)]
    else:
        row = dict(id=182, title=article['title'], status=article['status'], starts_on='2026-08-10', ends_on='2026-09-22', updated_at=article['updated_at'], categories=article['categories'], vendors=[dict(id=5, name='산업경영공학과')])
        data = dict(content=[row], page_info=dict(current_page=1, size=8, total_items=1, total_pages=1, has_next=False))
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=1280, height=1507), device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('https://api.inha-inform.today/**', route_api)
    page.route('https://fixture.test/**', lambda route: route.fulfill(content_type='image/png', body=PNG))
    page.route('**/*google-analytics*/**', lambda route: route.abort())
    page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{name:'관리자01',role:'ADMIN'}},version:0}))")
    page.goto(BASE+'/manage/detail/182')
    info = page.get_by_role('region', name='게시글 정보', exact=True)
    content = page.get_by_role('region', name='게시글 본문', exact=True)
    row = lambda label: info.locator('dt').filter(has_text=label).locator('..').locator('dd')
    expect(row('게시글 ID')).to_have_text('182')
    expect(row('행사 기간')).to_have_text('2026.08.10 ~ 2026.09.22')
    expect(row('상태')).to_have_text('운영 중')
    expect(page.locator('time')).to_have_text('2026.07.30 12:00:10')
    expect(content.locator('strong').first).to_contain_text('2026.08.10')
    expect(content.locator('li')).to_have_count(4)
    source = info.get_by_role('link', name='산업경영공학과 수집 출처 원본 보기 (새 창)')
    expect(source).to_have_attribute('href', 'https://inha.ac.kr/original')
    expect(source).to_have_attribute('rel', 'noopener noreferrer')
    expect(info.get_by_role('link', name='컴퓨터공학과')).to_have_count(0)
    expect(page.get_by_role('link', name='수정하기', exact=True)).to_have_attribute('href', '/manage/edit/182')
    expect(page.get_by_role('button', name='삭제하기')).to_have_count(0)
    page.evaluate('document.fonts.ready')
    page.add_style_tag(content='.tsqd-parent-container { display:none !important; }')
    page.screenshot(path=str(OUTPUT/'desktop.png'), full_page=True)
    page.set_viewport_size(dict(width=430, height=932))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(OUTPUT/'mobile.png'), full_page=True)
    page.set_viewport_size(dict(width=1280, height=1000))
    # Direct entry back button safely returns home; list entry returns to its list.
    page.get_by_role('button', name='뒤로 가기', exact=True).click()
    expect(page).to_have_url(BASE+'/manage')
    page.get_by_role('link', name=article['title'], exact=True).click()
    expect(page).to_have_url(BASE+'/manage/detail/182')
    page.get_by_role('button', name='뒤로 가기', exact=True).click()
    expect(page).to_have_url(BASE+'/manage')
    page.get_by_role('link', name=article['title'], exact=True).click()
    page.get_by_role('link', name='수정하기', exact=True).click()
    expect(page).to_have_url(BASE+'/manage/edit/182')
    expect(page.get_by_label('게시글 제목', exact=True)).to_have_value(article['title'])
    expect(page.get_by_role('textbox', name='게시글 본문')).to_contain_text('수강신청 방법')
    # All real statuses including trash still render, without a user-facing publication filter.
    for status, label in [('PENDING_REVIEW', '미검수'), ('READY_TO_PUBLISH', '반영대기'), ('DRAFT', '임시저장'), ('TRASHED', '휴지통')]:
        article['status'] = status
        article['source_type'] = 'CLUB' if status == 'DRAFT' else 'SCHOOL'
        page.goto(BASE+'/manage/detail/182')
        expect(row('상태')).to_have_text(label)
        expect(page.get_by_role('link', name='수정하기', exact=True)).to_be_visible()
    # Optional fields and empty arrays do not leak undefined or crash.
    article = dict(original, categories=[], vendors=[], content='', attachments=[])
    article.pop('starts_on'); article.pop('ends_on')
    page.reload()
    expect(row('카테고리')).to_have_text('미분류')
    expect(row('출처')).to_have_text('등록된 출처 없음')
    expect(row('행사 기간')).to_have_text('기간 미정')
    expect(content).to_contain_text('등록된 본문이 없습니다.')
    article['ends_on'] = '2026-09-22'
    page.reload()
    expect(row('행사 기간')).to_have_text('미정 ~ 2026.09.22')
    # Render rich HTML, keep typography and task state, remove executable content and overlays.
    article = copy.deepcopy(original)
    article['content'] = '''<h2>HTML 검증</h2><p style="font-size:20px;color:rgb(255, 0, 0);position:fixed;inset:0;z-index:99999" class="fixed inset-0">서식 유지</p>
      <script>window.unsafeExecuted=true</script><img src="https://fixture.test/poster.png" onload="window.unsafeExecuted=true" width="2000" alt="포스터">
      <img src="javascript:alert(1)"><iframe src="https://fixture.test/frame"></iframe><form><button>가짜 로그인</button></form>
      <a href="javascript:alert(1)">위험 링크</a><a href="https://inha.ac.kr/notice">정상 링크</a><a href="mailto:academic@inha.ac.kr">메일</a>
      <table width="2000"><tbody><tr><th>항목</th><td>값</td></tr></tbody></table><pre><code>긴코드''' + 'x'*300 + '''</code></pre>
      <ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div><p>완료 항목</p></div></li></ul>'''
    article['attachments'] = [dict(id=7, file_url='https://fixture.test/poster.png', original_name='포스터.png'), dict(id=8, file_url='https://fixture.test/file.pdf'), dict(id=9, file_url='javascript:alert(1)', original_name='잘못된 첨부')]
    article['vendors'].append(dict(id=90, vendor_id=5, vendor_name='같은 제공처의 다른 원본', source_url='https://inha.ac.kr/another'))
    article['vendors'].append(dict(id=91, vendor_id=7, vendor_name='잘못된 출처', source_url='javascript:alert(1)'))
    page.reload()
    expect(content.get_by_role('heading', name='HTML 검증')).to_be_visible()
    expect(content.locator('script, iframe, form, button, input')).to_have_count(0)
    expect(content.locator('[onload], [onclick], [onerror], [class="fixed inset-0"]')).to_have_count(0)
    expect(content.locator('a').filter(has_text='위험 링크')).not_to_have_attribute('href', 'javascript:alert(1)')
    expect(content.get_by_role('link', name='정상 링크')).to_have_attribute('target', '_blank')
    expect(content.get_by_role('link', name='메일')).to_have_attribute('href', 'mailto:academic@inha.ac.kr')
    styled = content.get_by_text('서식 유지', exact=True)
    assert styled.evaluate('(el) => el.style.fontSize') == '20px'
    assert styled.evaluate('(el) => el.style.position') == ''
    expect(content.locator('li[data-checked="true"]')).to_have_count(1)
    expect(content.locator('img')).to_have_count(1)
    assert not page.evaluate('window.unsafeExecuted || false')
    expect(page.get_by_role('link', name='포스터.png (새 창)')).to_have_attribute('href', 'https://fixture.test/poster.png')
    expect(page.get_by_role('link', name='첨부 파일 2 (새 창)')).to_be_visible()
    expect(page.get_by_role('link', name='잘못된 첨부')).to_have_count(0)
    expect(info.get_by_role('link', name='잘못된 출처')).to_have_count(0)
    expect(info.get_by_role('link', name='같은 제공처의 다른 원본 원본 보기 (새 창)')).to_be_visible()
    page.set_viewport_size(dict(width=430, height=932))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    # Invalid route IDs never issue detail requests.
    for invalid in ['abc', '0', '-1', '1.2', '9007199254740992']:
        requests.clear(); page.goto(BASE+'/manage/detail/'+invalid)
        expect(page.get_by_role('alert')).to_contain_text('올바르지 않은 게시글 ID')
        assert not requests, requests
        expect(page.get_by_role('link', name='수정하기', exact=True)).to_have_count(0)
    mode = 'hold'
    page.goto(BASE+'/manage/detail/182')
    expect(page.get_by_role('status')).to_contain_text('불러오는 중')
    assert len(held) == 1
    held.pop().fulfill(json=dict(success=True, data=original)); mode = 'normal'
    expect(row('상태')).to_have_text('운영 중')
    mode = 'not-found'; requests.clear(); page.reload()
    expect(page.get_by_role('alert')).to_contain_text('게시글을 찾을 수 없습니다')
    expect(page.get_by_role('link', name='수정하기', exact=True)).to_have_count(0)
    assert len(requests) == 1
    mode = 'server-error'; page.reload()
    expect(page.get_by_role('alert')).to_contain_text('게시글을 불러오지 못했습니다', timeout=15000)
    mode = 'normal'; page.get_by_role('button', name='다시 시도', exact=True).click()
    expect(info).to_be_visible()
    mode = 'forbidden'; requests.clear(); page.reload()
    expect(page.get_by_role('alert')).to_contain_text('관리자 접근 권한')
    page.wait_for_timeout(1500)
    assert len(requests) == 1
    page.get_by_role('link', name='다시 로그인').click()
    expect(page).to_have_url(BASE+'/login')
    assert page.evaluate('history.state.usr.from.pathname') == '/manage/detail/182'
    assert not errors, errors
    browser.close()
print('PASS: MANDTR detail contract, status/optional fields, source/attachment URLs, sanitized rich HTML, direct/list back navigation, editor link, invalid IDs, loading/404/403/retry, desktop/mobile')
