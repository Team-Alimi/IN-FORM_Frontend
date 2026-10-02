"""Vite :5173 + Playwright. Render the actual tab bar with a memory router."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUTPUT = Path(__file__).parent / 'screenshots' / 'tab-bar'
OUTPUT.mkdir(parents=True, exist_ok=True)
labels = ['홈', '공지', '동아리', '북마크', '마이페이지']
paths = ['/', '/events', '/clubs', '/bookmarks', '/mypage']

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport=dict(width=375, height=812))
    page.route('https://api.inha-inform.today/**', lambda route: route.abort())
    page.goto('http://127.0.0.1:5173/login')
    page.evaluate('''async () => {
      const resource = name => performance.getEntriesByType('resource').find(e => new URL(e.name).pathname.endsWith('/'+name+'.js')).name;
      const {default: React} = await import(resource('react'));
      const {default: ReactDOM} = await import(resource('react-dom_client'));
      const {MemoryRouter, useLocation} = await import(resource('react-router-dom'));
      const {default: TabBar} = await import('/src/components/main/mobile/common/MobileTabBar.jsx');
      document.getElementById('root').style.display = 'none';
      document.body.style.background = '#f8f9fa';
      const host = document.createElement('div'); host.id = 'tab-fixture'; document.body.append(host);
      const root = ReactDOM.createRoot(host);
      const paths = ['/', '/events', '/clubs', '/bookmarks', '/mypage'];
      function View() {
        const location = useLocation();
        return React.createElement(React.Fragment, null,
          React.createElement('output', {id:'test-path'}, location.pathname),
          React.createElement(TabBar, {activeIndex: paths.indexOf(location.pathname)}));
      }
      root.render(React.createElement(MemoryRouter, null, React.createElement(View)));
    }''')
    nav = page.get_by_role('navigation', name='모바일 메뉴')
    expect(nav).to_be_visible()
    page.evaluate('document.fonts.ready')
    for i, label in enumerate(labels):
        button = nav.get_by_role('button', name=label, exact=True)
        button.click()
        expect(page.locator('#test-path')).to_have_text(paths[i])
        expect(button).to_have_attribute('aria-current', 'page')
        expect(nav.locator('[aria-current="page"]')).to_have_count(1)
        expect(button).to_have_css('color', 'rgb(0, 0, 0)')
        expect(button).to_have_css('background-color', 'rgb(243, 244, 246)')
        page.screenshot(path=str(OUTPUT/f'{i}.png'), clip=dict(x=27, y=710, width=320, height=102))
    for width in [320, 375, 430]:
        page.set_viewport_size(dict(width=width, height=812))
        box = nav.bounding_box()
        viewport = nav.locator('..').bounding_box()['width']
        expected_width = min(280, viewport - 32)
        assert box['width'] == expected_width and box['height'] == 68, box
        assert abs(box['x'] - (viewport-expected_width)/2) < 1
        assert abs(812 - box['y'] - box['height'] - 12) < 1
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert nav.get_by_role('button').first.bounding_box()['width'] >= 44
        assert page.locator('#tab-fixture > div[aria-hidden="true"]').bounding_box()['height'] == 80
        assert page.evaluate("!document.elementFromPoint(1, 760).closest('footer')")
    browser.close()
print('PASS: five selected states, navigation, 320/375/430px layout, 80px reserved space, transparent margin hit testing')
