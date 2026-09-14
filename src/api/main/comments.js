import api from "@/api/axios";

/**
 * 댓글 목록 조회 (created_at ASC 고정)
 * @param {number} articleId - 공지 ID
 * @param {Object} params - page, size
 * @returns {Promise<{ content: Array, page_info: Object }>}
 */
export async function fetchComments(articleId, params = {}) {
  try {
    const res = await api.get(`/api/v1/articles/${articleId}/comments`, { params });
    return res.data.data;
  } catch (error) {
    console.error("[API] fetchComments 에러 발생:", error);
    throw error;
  }
}

/**
 * 댓글 작성
 * @param {number} articleId - 공지 ID
 * @param {string} content - 댓글 내용 (1-1000자)
 * @returns {Promise<Object>} 작성된 댓글 객체
 */
export async function postComment(articleId, content) {
  try {
    const res = await api.post(`/api/v1/articles/${articleId}/comments`, { content });
    return res.data.data;
  } catch (error) {
    console.error("[API] postComment 에러 발생:", error);
    throw error;
  }
}

/**
 * 댓글 수정
 * @param {number} commentId - 댓글 ID
 * @param {string} content - 수정할 내용
 * @returns {Promise<Object>} { success: true }
 */
export async function patchComment(commentId, content) {
  try {
    const res = await api.patch(`/api/v1/comments/${commentId}`, { content });
    return res.data;
  } catch (error) {
    console.error("[API] patchComment 에러 발생:", error);
    throw error;
  }
}

/**
 * 댓글 삭제
 * @param {number} commentId - 댓글 ID
 * @returns {Promise<Object>} { success: true }
 */
export async function deleteComment(commentId) {
  try {
    const res = await api.delete(`/api/v1/comments/${commentId}`);
    return res.data;
  } catch (error) {
    console.error("[API] deleteComment 에러 발생:", error);
    throw error;
  }
}
