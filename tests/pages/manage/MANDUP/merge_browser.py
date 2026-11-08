"""Run against Vite on :5173. API calls are mocked; no real articles are merged."""
import os
from urllib.parse import urlparse

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
requests = []
errors = []


def article(article_id, title, status, similar_id=None):
    data = dict(
        id=article_id, source_type='SCHOOL', status=status, title=title,
        content='<p>신청 기간과 내용을 확인하세요.</p>',
        starts_on='2026-11-10', ends_on='2026-11-20',
        created_at='2026-11-01T00:00:00Z', updated_at='2026-11-02T00:00:00Z',
        categories=[dict(id=1, name='장학')],
        vendors=[dict(id=article_id, vendor_id=3, vendor_name='컴퓨터공학과', source_url='https://example.com')],
        attachments=[dict(id=article_id, file_url='https://example.com/file.pdf', original_name='안내.pdf')],
    )
    if similar_id is not None:
        data['similar_article_id'] = similar_id
        data['similarity_score'] = 91
    return data


original = article(42, '원본 장학 공지', 'PENDING_REVIEW', 39)
similar = article(39, '기존 장학 공지', 'PUBLISHED')


def route_api(route):
    request = route.request
    path = urlparse(request.url).path
    requests.append((request.method, path, request.post_data_json if request.method == 'POST' else None))
    if path == '/api/v1/admin/articles/42':
        data = original
    elif path == '/api/v1/admin/articles/77':
        data = article(77, '비교 대상 없는 공지', 'PENDING_REVIEW')
    elif path == '/api/v1/admin/articles/42/similar':
        data = dict(article=original, similar=similar, similarity_score=91)
    elif path == '/api/v1/admin/articles/77/similar':
        data = dict(article=article(77, '비교 대상 없는 공지', 'PENDING_REVIEW'))
    elif path == '/api/v1/admin/articles/merge':
        assert request.method == 'POST'
        assert request.post_data_json == {'target_id': 39, 'source_ids': [42]}
        data = dict(target_id=39, merged=[42], moved=dict(
            vendors=1, bookmarks=5, attachments=1, categories=1,
            comments=2, notifications=3,
        ))
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

    page.goto(BASE + '/manage/detail/42')
    page.get_by_role('link', name='유사 공지 비교').click()
    expect(page.get_by_role('heading', name='유사 공지 비교·병합')).to_be_visible()
    expect(page.get_by_role('heading', name='원본 장학 공지')).to_be_visible()
    expect(page.get_by_role('heading', name='기존 장학 공지')).to_be_visible()
    expect(page.get_by_text('유사도 91점')).to_be_visible()
    expect(page.get_by_role('button', name='선택한 공지로 병합')).to_be_disabled()
    page.get_by_role('radio', name='이 공지를 남기기').nth(1).check()
    page.get_by_role('button', name='선택한 공지로 병합').click()
    dialog = page.get_by_role('dialog', name='중복 공지를 병합할까요?')
    expect(dialog.get_by_role('button', name='병합 실행')).to_be_disabled()
    dialog.get_by_role('textbox').fill('병합')
    dialog.get_by_role('button', name='병합 실행').click()
    expect(page.get_by_role('heading', name='병합이 완료되었습니다')).to_be_visible()
    expect(page.get_by_text('남은 공지 #39')).to_be_visible()
    expect(page.get_by_text('북마크').locator('..')).to_contain_text('5건')
    assert requests[-1] == ('POST', '/api/v1/admin/articles/merge', {'target_id': 39, 'source_ids': [42]})

    page.goto(BASE + '/manage/detail/77')
    page.get_by_role('link', name='유사 공지 비교').click()
    expect(page.get_by_text('비교할 유사 공지가 없습니다.')).to_be_visible()
    expect(page.get_by_role('button', name='선택한 공지로 병합')).to_have_count(0)
    page.set_viewport_size(dict(width=390, height=844))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    browser.close()
