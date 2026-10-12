"""Verify bounded AI summary polling on event and club detail pages."""

from playwright.sync_api import expect, sync_playwright


def detail(article_id, source_type):
    return {
        'id': article_id,
        'source_type': source_type,
        'title': '요약 테스트 공지',
        'content': '본문 테스트',
        'summary_status': 'PENDING',
        'deadline_status': 'ONGOING',
        'published_at': '2026-10-12T00:00:00+09:00',
        'starts_on': '2026-10-12',
        'ends_on': '2026-10-20',
        'bookmark_count': 0,
        'view_count': 0,
        'is_bookmarked': False,
        'categories': [],
        'vendors': [],
        'attachments': [],
    }


with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    for source_type, width, answers in [
        ('SCHOOL', 1280, ['PENDING', 'READY']),
        ('CLUB', 375, ['PENDING'] * 4),
    ]:
        page = browser.new_page(viewport={'width': width, 'height': 900})
        page.add_init_script(
            "localStorage.setItem('auth-storage', JSON.stringify({state: "
            "{isLogIn: true, accessToken: 'test-token', userInfo: {name: '테스트'}}, version: 0}))"
        )
        summary_calls = []
        detail_calls = []

        def route_api(route):
            path = route.request.url.split('?')[0]
            if path.endswith('/articles/123/summary'):
                summary_calls.append(path)
                status = answers[min(len(summary_calls) - 1, len(answers) - 1)]
                data = {'summary_status': status}
                if status == 'READY':
                    data['summary'] = '완성된 AI 요약'
            elif path.endswith('/articles/123'):
                detail_calls.append(path)
                data = detail(123, source_type)
            elif path.endswith('/notifications/unread-count'):
                data = {'unread_count': 0}
            else:
                data = []
            route.fulfill(json={'success': True, 'data': data})

        page.route('**/api/v1/**', route_api)
        page.goto(
            f'http://127.0.0.1:5173/{"events" if source_type == "SCHOOL" else "clubs"}/detail/123'
        )
        expect(page.get_by_text('AI 요약 생성 중…')).to_be_visible()
        initial_detail_calls = len(detail_calls)
        if source_type == 'SCHOOL':
            expect(page.get_by_text('완성된 AI 요약')).to_be_visible(timeout=6000)
            assert len(summary_calls) == 2
        else:
            expect(page.get_by_text('AI 요약 생성 중…')).to_have_count(0, timeout=10000)
            assert len(summary_calls) == 4
            page.wait_for_timeout(2200)
            assert len(summary_calls) == 4
        assert len(detail_calls) == initial_detail_calls, '상세 API를 폴링하면 안 됩니다.'
        page.close()
    browser.close()
