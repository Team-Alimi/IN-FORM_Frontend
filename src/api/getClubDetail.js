import api from "./axios";

/**
 * 단일 동아리 공지사항 상세 조회
 * @param {number|string} id - 게시글 고유 ID
 * @returns {Promise}
 */
export const fetchClubDetail = async (id) => {
  const res = await api.get(`/api/v1/club_articles/${id}`);
  return res.data.data;
};
