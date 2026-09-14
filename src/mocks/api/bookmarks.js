/**
 * [MOCK] src/api/main/bookmarks.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 북마크 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수 (v2 기준):
 *   - fetchBookmarks        : 북마크 목록 반환 (source_type·keyword 필터 지원)
 *   - addBookmark           : 북마크 추가 (멱등 PUT)
 *   - deleteBookmark        : 개별 북마크 해제 (멱등 DELETE)
 *   - deleteAllBookmarks    : 전체 또는 source_type별 전체 삭제
 *   - postBookmark          : v1 호환 (BookmarkButton 내부에서 사용)
 *
 * 주의: 페이지 새로고침 시 북마크 상태가 초기 더미 데이터로 리셋됩니다.
 */
import {
  MOCK_BOOKMARKS,
  MOCK_SCHOOL_ARTICLES,
  MOCK_CLUB_ARTICLES,
} from "@/mocks/data";

// 런타임 북마크 상태 (메모리 내 임시 저장)
let _bookmarks = [...MOCK_BOOKMARKS];

// ─── v2 API ──────────────────────────────────────────────────────────────────

/**
 * 북마크 목록 조회
 * @param {Object} params - source_type?, keyword?, page?, size?
 */
export const fetchBookmarks = async (params = {}) => {
  const { source_type, keyword, page = 1, size = 20 } = params;

  let result = [..._bookmarks];

  if (source_type) {
    result = result.filter((b) => b.source_type === source_type);
  }
  if (keyword && keyword.trim()) {
    result = result.filter((b) => b.title.includes(keyword.trim()));
  }

  const total = result.length;
  const start = (page - 1) * size;
  const content = result.slice(start, start + size);

  return {
    data: {
      content,
      page_info: {
        current_page: page,
        size,
        total_pages: Math.ceil(total / size) || 0,
        total_items: total,
        has_next: start + size < total,
      },
    },
  };
};

/**
 * 북마크 추가 (멱등 PUT)
 * @param {number} articleId
 */
export const addBookmark = async (articleId) => {
  const alreadyExists = _bookmarks.some((b) => b.id === articleId);
  if (!alreadyExists) {
    const allArticles = [...MOCK_SCHOOL_ARTICLES, ...MOCK_CLUB_ARTICLES];
    const article = allArticles.find(
      (a) => a.id === articleId || a.article_id === articleId
    );
    if (article) {
      _bookmarks = [..._bookmarks, { ...article, is_bookmarked: true }];
    }
  }
  return { success: true };
};

/**
 * 북마크 해제 (멱등 DELETE)
 * @param {number} articleId
 */
export const deleteBookmark = async (articleId) => {
  _bookmarks = _bookmarks.filter((b) => b.id !== articleId);
  return { success: true };
};

/**
 * 전체 북마크 삭제
 * @param {Object} params - source_type? ("SCHOOL" | "CLUB", 생략 시 전체)
 */
export const deleteAllBookmarks = async (params = {}) => {
  const { source_type } = params;
  if (source_type) {
    _bookmarks = _bookmarks.filter((b) => b.source_type !== source_type);
  } else {
    _bookmarks = [];
  }
  return { success: true };
};

// ─── v1 호환 (BookmarkButton 내부에서 사용) ──────────────────────────────────

/** @deprecated v2에서 addBookmark / deleteBookmark 로 분리됨 */
export const postBookmark = async (article_type, article_id) => {
  const alreadyExists = _bookmarks.some((b) => b.id === article_id);
  if (!alreadyExists) {
    const source =
      article_type === "CLUB" ? MOCK_CLUB_ARTICLES : MOCK_SCHOOL_ARTICLES;
    const article = source.find(
      (a) => a.id === article_id || a.article_id === article_id
    );
    if (article) {
      _bookmarks = [..._bookmarks, { ...article, is_bookmarked: true }];
    }
  }
  return true;
};
