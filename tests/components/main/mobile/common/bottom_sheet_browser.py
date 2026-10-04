"""Vite :5173 + Playwright; isolated shared BottomSheet, no backend writes."""
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 430, 'height': 932})
    page.route('https://api.inha-inform.today/**', lambda route: route.abort())
    page.goto('http://127.0.0.1:5173/login')
    page.evaluate('''async () => {
      const resource = name => performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname.endsWith('/'+name+'.js')).name;
      const {default: React} = await import(resource('react'));
      const {default: ReactDOM} = await import(resource('react-dom_client'));
      const {default: Sheet} = await import('/src/components/main/mobile/common/BottomSheet.jsx');
      const host = document.createElement('div'); document.body.append(host);
      const root = ReactDOM.createRoot(host);
      window.closes = 0;
      window.openSheet = () => render(true);
      function render(open) {
        root.render(React.createElement(Sheet, {isOpen:open,
          onClose:() => { window.closes++; render(false); }},
          React.createElement('div', {style:{height:1200}}, 'Fixture content')));
      }
      render(true);
    }''')
    handle = page.locator('.touch-none.cursor-grab')
    expect(handle).to_be_visible()
    page.wait_for_timeout(400)
    def drag(distance):
        box = handle.bounding_box()
        x, y = box['x'] + box['width']/2, box['y'] + box['height']/2
        page.mouse.move(x, y)
        page.mouse.down()
        page.mouse.move(x, y+distance, steps=8)
        page.mouse.up()
    drag(30)
    page.wait_for_timeout(250)
    assert page.evaluate('window.closes') == 0
    assert page.locator('[data-bottom-sheet]').evaluate("el => getComputedStyle(el).translate") == '0px'
    # Body scroll does not dismiss the sheet.
    content = page.get_by_text('Fixture content', exact=True).locator('..')
    content.evaluate('el => el.scrollTop = 200')
    assert content.evaluate('el => el.scrollTop') > 0
    assert page.evaluate('window.closes') == 0
    drag(110)
    expect(handle).to_have_count(0)
    assert page.evaluate('window.closes') == 1
    page.evaluate('window.openSheet()')
    expect(handle).to_be_visible()
    page.wait_for_timeout(400)
    assert page.locator('[data-bottom-sheet]').evaluate("el => getComputedStyle(el).translate") == '0px'
    # Tapping outside remains supported.
    page.mouse.click(10, 10)
    expect(handle).to_have_count(0)
    assert page.evaluate('window.closes') == 2
    page.evaluate('window.openSheet()')
    expect(handle).to_be_visible()
    page.wait_for_timeout(400)
    cdp = page.context.new_cdp_session(page)
    box = handle.bounding_box()
    x, y = box['x'] + box['width']/2, box['y'] + box['height']/2
    def touch(kind, dy=0):
        cdp.send('Input.dispatchTouchEvent', {'type':kind, 'touchPoints': [] if kind in ['touchEnd', 'touchCancel'] else [{'x':x, 'y':y+dy}]})
    touch('touchStart')
    touch('touchMove', 110)
    touch('touchCancel')
    page.wait_for_timeout(250)
    assert page.evaluate('window.closes') == 2
    assert page.locator('[data-bottom-sheet]').evaluate("el => getComputedStyle(el).translate") == '0px'
    touch('touchStart')
    touch('touchMove', 110)
    touch('touchEnd')
    expect(handle).to_have_count(0)
    assert page.evaluate('window.closes') == 3
    # Simulate the visible viewport shrinking while Safari toolbars are expanded.
    page.evaluate('''() => {
      Object.defineProperty(visualViewport, 'height', {configurable:true, get:() => 550});
      Object.defineProperty(visualViewport, 'offsetTop', {configurable:true, get:() => 24});
      window.openSheet();
    }''')
    expect(handle).to_be_visible()
    page.wait_for_timeout(400)
    sheet = page.locator('[data-bottom-sheet]')
    box = sheet.bounding_box()
    assert box['y'] >= 24 + 48
    assert box['y'] + box['height'] <= 574.5
    assert box['height'] <= 550 * .85 + 1
    assert page.evaluate('document.body.style.position') == 'fixed'
    original_handle_y = handle.bounding_box()['y']
    page.locator('[data-bottom-sheet-content]').evaluate('el => el.scrollTop = 600')
    assert abs(handle.bounding_box()['y'] - original_handle_y) < 1
    page.evaluate('''() => {
      Object.defineProperty(visualViewport, 'height', {configurable:true, get:() => 450});
      visualViewport.dispatchEvent(new Event('resize'));
    }''')
    assert sheet.bounding_box()['height'] <= 450 * .85 + 1
    page.get_by_role('button', name='바텀시트 닫기').click()
    expect(handle).to_have_count(0)
    assert page.evaluate('window.closes') == 4
    assert page.evaluate('document.body.style.position') != 'fixed'
    browser.close()
print('PASS: drag, touch cancel, content scroll, backdrop/button close, viewport resize/offset and body unlock')
