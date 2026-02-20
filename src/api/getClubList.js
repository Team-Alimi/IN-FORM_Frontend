import api from "./axios";

/**
 * 동아리 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword 등
 * @returns {Promise}
 */
export const fetchClubs = (params) => {
  return api.get("/api/v1/club_articles", { params });
};

// 마감임박 동아리 행사 API (현재 미사용, 필요시 주석 해제)
// export const fetchImminentClubs = () => {
//   return api.get("/api/v1/deadline/club_articles");
// };
