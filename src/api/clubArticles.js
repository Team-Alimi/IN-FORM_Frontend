import api from "./axios";

/**
 * 동아리 공지사항 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword 등
 * @returns {Promise}
 */
export const fetchClubs = (params) => {
  return api.get("/api/v1/club_articles", { params });
};

/**
 * 동아리 공지사항 상세 조회
 * @param {number|string} id - 게시글 고유 ID
 * @returns {Promise}
 */
export const fetchClubDetail = async (id) => {
  const res = await api.get(`/api/v1/club_articles/${id}`);
  return res.data.data;
};

// 마감임박 동아리 공지사항 목록 조회 (현재 미사용, 필요시 주석 해제)
// export const fetchImminentClubs = () => {
//   return api.get("/api/v1/deadline/club_articles");
// };
