import api from "./axios";

/**
 * 단일 학교 공지사항 상세 조회
 * @param {number|string} id - 게시글 고유 ID
 * @returns {Promise}
 */
export const fetchEventDetail = async (id) => {
  const res = await api.get(`/api/v1/school_articles/${id}`);
  return res.data.data;
};
