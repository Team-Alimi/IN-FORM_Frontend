import type { OManageArticleDetail } from '@/api/manage/dto/adminDto';

/**
 * 게시글 상세 조회 테스트를 위한 모킹 데이터입니다.
 */
export const MOCK_MANAGE_ARTICLE_DETAIL: OManageArticleDetail = {
  success: true,
  data: {
    id: 42,
    source_type: 'SCHOOL',
    status: 'PENDING_REVIEW',
    title: '2026학년도 1학기 국가장학금 신청 안내',
    content:
      '<p>2026학년도 1학기 국가장학금 2차 신청을 아래와 같이 안내합니다.</p>',
    summary: '8월 20일까지 국가장학금 2차 신청. 신입생·편입생도 대상.',
    starts_on: '2026-08-01',
    ends_on: '2026-08-20',
    published_at: '2026-07-25T09:12:00+09:00',
    similarity_score: 91.0,
    similar_article_id: 39,
    created_at: '2026-07-24T03:10:00+09:00',
    updated_at: '2026-07-26T14:02:00+09:00',
    categories: [{ id: 1, name: '장학금' }],
    vendors: [
      {
        id: 88,
        vendor_id: 3,
        vendor_name: '컴퓨터공학과',
        source_url: 'https://cse.inha.ac.kr/bbs/12345',
        external_key: '12345',
      },
    ],
    attachments: [
      {
        id: 7,
        file_url: 'https://cdn.inform.today/articles/42/poster.png',
        original_name: '포스터.png',
        content_type: 'image/png',
        size_bytes: 482301,
      },
    ],
  },
  error: null,
};
