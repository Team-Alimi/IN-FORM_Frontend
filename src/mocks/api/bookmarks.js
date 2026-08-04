/**
 * [MOCK] src/api/main/bookmarks.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 북마크 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchSchoolBookmarks   : 북마크 목록 반환 (모듈 메모리에 임시 저장)
 *   - postBookmark           : 북마크 추가 (항상 true 반환, 실제 저장 없음)
 *   - deleteSchoolBookmark   : 특정 항목 북마크 삭제 (메모리에서 제거)
 *   - deleteSchoolBookmarksAll : 전체 북마크 삭제 (메모리 초기화)
 *
 * 주의: 페이지 새로고침 시 북마크 상태가 초기 더미 데이터로 리셋됩니다.
 */
import { MOCK_BOOKMARKS } from "@/mocks/data";

// 런타임 북마크 상태 (메모리 내 임시 저장)
let _bookmarks = [...MOCK_BOOKMARKS];

export const fetchSchoolBookmarks = async () => {
  return { data: { school_articles: _bookmarks } };
};

export const postBookmark = async (article_type, article_id) => {
  return true;
};

export const deleteSchoolBookmark = async (article_id) => {
  _bookmarks = _bookmarks.filter((b) => b.article_id !== article_id);
  return { data: { success: true } };
};

export const deleteSchoolBookmarksAll = async () => {
  _bookmarks = [];
  return { data: { success: true } };
};