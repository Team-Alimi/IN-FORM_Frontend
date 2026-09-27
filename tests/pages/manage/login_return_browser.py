"""Vite :5173 + Playwright. Google and backend responses are mocked."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
PATHS = ['/manage', '/manage/detail/1', '/manage/edit', '/manage/edit/1',
         '/manage/staged', '/manage/garbage', '/manage/unreviewed',
         '/manage/users', '/manage/vendors']
GOOGLE = """
window.google = {accounts: {id: {
  initialize(options) { window.testGoogleOptions = options; },
  renderButton(element) {
    const button = document.createElement('button');
    button.textContent = '테스트 Google 로그인';
    button.onclick = () => window.testGoogleOptions.callback({
      credential: 'fixture.' + btoa(JSON.stringify({email:'fixture@inha.edu'})) + '.fixture'
    });
    element.appendChild(button);
  },
  cancel() {}, disableAutoSelect() {}
}}};
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    for path in PATHS:
        context = browser.new_context()
        calls, errors = [], []
        def api(route):
            endpoint = urlparse(route.request.url).path
            calls.append(endpoint)
            if endpoint == '/api/v1/auth/login/google':
                route.fulfill(json=dict(success=True, data=dict(
                    access_token='fixture', refresh_token='fixture',
                    user_info=dict(user_id=1, name='관리자', role='ADMIN', onboarding_completed=True))))
            else:
                # All destination pages support this response; no real admin data is fetched.
                route.fulfill(status=403, json=dict(success=False, error=dict(code='FORBIDDEN', message='권한이 없습니다.')))
        context.route('https://api.inha-inform.today/**', api)
        context.route('https://accounts.google.com/gsi/client*', lambda route: route.fulfill(content_type='application/javascript', body=GOOGLE))
        context.route('**/*google-analytics*/**', lambda route: route.abort())
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE + path)
        expect(page).to_have_url(BASE + '/login')
        assert page.evaluate('history.state.usr.from.pathname') == path
        assert not calls, calls
        page.reload()
        expect(page).to_have_url(BASE + '/login')
        assert page.evaluate('history.state.usr.from.pathname') == path
        page.get_by_role('button', name='테스트 Google 로그인').click()
        expect(page).to_have_url(BASE + path)
        assert calls[0] == '/api/v1/auth/login/google', calls
        assert page.evaluate("JSON.parse(localStorage.getItem('auth-storage')).state.isLogIn")
        assert not errors, errors
        context.close()
    browser.close()
print('PASS: all 9 admin routes preserve destination before API calls and return after mocked Google login, including login reload')
