import instance from "./axios";

/**
 * 게시글 북마크 토글 (등록/해제)
 * @param {string} article_type - 게시글 타입 ("SCHOOL" | "CLUB")
 * @param {number} article_id - 게시글 고유 ID
 * @returns {Promise<boolean>} true: 등록됨, false: 해제됨
 */
export async function postBookmark(article_type, article_id) {
  const res = await instance.post("/api/v1/bookmarks", { article_type, article_id });
  return res.data.data;
}
