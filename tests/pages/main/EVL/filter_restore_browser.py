"""Run against Vite on :5173. API calls are mocked; no backend data changes."""
import re
from playwright.sync_api import expect, sync_playwright

BASE = "http://127.0.0.1:5173"
ARTICLE = {
    "id": 42,
    "source_type": "SCHOOL",
    "title": "Filter restore fixture",
    "content": "Fixture content",
    "deadline_status": "OPEN",
    "bookmark_count": 0,
    "is_bookmarked": False,
    "published_at": "2026-11-08T00:00:00Z",
    "vendors": [{"id": 7, "name": "Fixture department"}],
    "categories": [{"id": 3, "name": "Fixture category"}],
    "attachments": [],
    "summary_status": "NONE",
}


def route_api(route):
    path = route.request.url.split("?")[0]
    if path.endswith("/api/v1/articles/42"):
        data = ARTICLE
    elif path.endswith("/api/v1/articles"):
        data = {
            "content": [ARTICLE],
            "page_info": {"current_page": 1, "size": 10, "total_pages": 1,
                          "total_items": 1, "has_next": False},
        }
    elif path.endswith("/api/v1/categories"):
        data = [{"id": 3, "name": "Fixture category"}]
    elif path.endswith("/api/v1/vendors"):
        data = [{"id": 7, "name": "Fixture department"}]
    else:
        data = []
    route.fulfill(json={"success": True, "data": data})


with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    for width in (390, 1280):
        page = browser.new_page(viewport={"width": width, "height": 844})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route("https://api.inha-inform.today/**", route_api)
        page.add_init_script("localStorage.setItem('auth-storage', JSON.stringify({state:{isLogIn:true,accessToken:'fixture',refreshToken:'fixture'},version:0}))")
        page.goto(BASE + "/events", wait_until="domcontentloaded")

        filter_button = page.get_by_role("button", name="필터 열기" if width == 390 else "필터", exact=True)
        filter_button.click()
        category = page.get_by_role("button", name="Fixture category")
        department = page.get_by_role("button", name="Fixture department")
        category.click()
        department.click()
        page.get_by_role("button", name=re.compile("항목 보기")).click()

        page.get_by_text("Filter restore fixture").first.click()
        expect(page).to_have_url(BASE + "/events/detail/42")
        page.go_back()
        expect(page).to_have_url(BASE + "/events")
        filter_button.click()
        expect(category).to_have_attribute("aria-pressed", "true")
        expect(department).to_have_attribute("aria-pressed", "true")
        assert not errors, errors
        page.close()
    browser.close()
