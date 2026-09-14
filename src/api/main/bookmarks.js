import api from "@/api/axios";

/**
 * 북마크 목록 조회 (v2)
 * @param {Object} params - page, size, source_type, keyword, category_id 등
 * @returns {Promise<{ data: { content: Array, page_info: Object } }>}
 */
export async function fetchBookmarks(params) {
  try {
    const res = await api.get("/api/v1/bookmarks", { params });
    return res.data;
  } catch (error) {
    console.error("[API] fetchBookmarks 에러 발생:", error);
    throw error;
  }
}

/**
 * 게시글 북마크 추가 (v2 PUT — 멱등)
 * @param {number} articleId - 저장할 공지 ID
 * @returns {Promise}
 */
export async function addBookmark(articleId) {
  try {
    const res = await api.put(`/api/v1/bookmarks/articles/${articleId}`);
    return res.data;
  } catch (error) {
    console.error("북마크 추가 실패:", error);
    throw error;
  }
}

/**
 * 게시글 북마크 해제 (v2 DELETE — 멱등)
 * @param {number} articleId - 해제할 공지 ID
 * @returns {Promise}
 */
export async function deleteBookmark(articleId) {
  try {
    const res = await api.delete(`/api/v1/bookmarks/articles/${articleId}`);
    return res.data;
  } catch (error) {
    console.error(`[API] deleteBookmark (ID: ${articleId}) 에러 발생:`, error);
    throw error;
  }
}

/**
 * 북마크 전체 삭제 (v2)
 * @param {Object} params - source_type?: "SCHOOL" | "CLUB" (생략 시 전체)
 * @returns {Promise}
 */
export async function deleteAllBookmarks(params) {
  try {
    const res = await api.delete("/api/v1/bookmarks", { params });
    return res.data;
  } catch (error) {
    console.error("[API] deleteAllBookmarks 에러 발생:", error);
    throw error;
  }
}

