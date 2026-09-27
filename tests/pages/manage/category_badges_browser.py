"""Verify rendered admin badge colors against filterOption and CSS tokens. Vite :5173."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:5173')
names = ['학사', '대외활동', '취업·인턴십', '자격증', '공모전·대회', '행사·축제',
         '어학', '특강·세미나', '학술·연구', '장학금', '봉사활동', '기타', 'SCHOLARSHIP', '새 분류']
categories = [dict(id=i+1, name=name) for i, name in enumerate(names)]

def api(route):
    path = urlparse(route.request.url).path
    if path.endswith('/stats'):
        data = dict(pending_review=1, ready_to_publish=1)
    elif path.endswith('/categories'): data = categories
    elif path.endswith('/vendors'): data = []
    else:
        row = dict(id=1, title='색상 검증', status='PENDING_REVIEW', previous_status='PUBLISHED',
                   categories=categories, vendors=[], updated_at='2026-09-27T00:00:00Z')
        data = dict(content=[row], page_info=dict(current_page=1, size=8, total_items=1, total_pages=1, has_next=False))
    route.fulfill(json=dict(success=True, data=data))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.route('https://api.inha-inform.today/**', api)
    page.add_init_script("localStorage.setItem('auth-storage',JSON.stringify({state:{isLogIn:true,accessToken:'fixture',userInfo:{role:'ADMIN'}},version:0}))")
    for path in ['/manage', '/manage/unreviewed', '/manage/staged', '/manage/garbage']:
        page.goto(BASE+path)
        badges = page.locator('tbody tr').first.locator('td').nth(2).locator('span')
        expect(badges).to_have_count(len(names))
        result = badges.evaluate_all("""async elements => {
          const {CATEGORY_NAME_COLOR_MAP: colors, CATEGORY_CODE_TO_NAME_MAP: names, DEFAULT_CATEGORY_COLOR: fallback} = await import('/src/constants/filterOption.js');
          const sourceNames = %s;
          return elements.map((el, i) => {
            const name = names[sourceNames[i]] ?? sourceNames[i];
            const color = colors[name] ?? fallback;
            const expected = document.createElement('span');
            expected.style.backgroundColor = `var(--color-${color.bg.slice(3)})`;
            expected.style.color = `var(--color-${color.text.slice(5)})`;
            expected.style.borderColor = `var(--color-${color.border.slice(7)})`;
            document.body.appendChild(expected);
            const actualStyle = getComputedStyle(el), expectedStyle = getComputedStyle(expected);
            const matches = el.textContent === name && ['backgroundColor','color','borderTopColor'].every(key => actualStyle[key] === expectedStyle[key]);
            expected.remove();
            return {name, matches};
          });
        }""" % __import__('json').dumps(names))
        assert all(item['matches'] for item in result), (path, result)
    browser.close()
print('PASS: 12 category colors, English code mapping and unknown fallback on home/unreviewed/staged/trash')
