import api from "@/api/axios";

/**
 * 북마크한 학교 글 목록 조회
 * @param {Object} params - page, size, category_id, keyword
 * @returns {Promise}
 */
export async function fetchSchoolBookmarks(params) {
  try {
    const res = await api.get("/api/v1/bookmarks/school", { params });
    return res.data;
  } catch (error) {
    console.error("[API] fetchSchoolBookmarks 에러 발생:", error);
    throw error;
  }
}

/**
 * 게시글 북마크 토글 (등록/해제)
 * @param {string} article_type - 게시글 타입 ("SCHOOL" | "CLUB")
 * @param {number} article_id - 게시글 고유 ID
 * @returns {Promise<boolean>} true: 등록됨, false: 해제됨
 */
export async function postBookmark(article_type, article_id) {
  try {
    const res = await api.post("/api/v1/bookmarks", { article_type, article_id });
    return res.data.data;
  } catch (error) {
    console.error("북마크 처리 실패:", error);
    throw error;
  }
}

/**
 * 북마크한 학교 공지사항 개별 삭제
 * @param {number} article_id - 삭제할 게시글의 고유 식별자
 * @returns {Promise}
 */
export async function deleteSchoolBookmark(article_id) {
  try {
    const res = await api.delete(`/api/v1/bookmarks/school/${article_id}`);
    return res.data;
  } catch (error) {
    console.error(`[API] deleteSchoolBookmark (ID: ${article_id}) 에러 발생:`, error);
    throw error;
  }
}

/**
 * 북마크한 학교글 전체 삭제
 * @returns {Promise}
 */
export async function deleteSchoolBookmarksAll() {
  try {
    const res = await api.delete("/api/v1/bookmarks/school/all");
    return res.data;
  } catch (error) {
    console.error("[API] deleteSchoolBookmarksAll 에러 발생:", error);
    throw error;
  }
}
