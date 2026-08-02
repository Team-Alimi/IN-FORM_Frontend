import api from "@/api/axios";

/**
 * 동아리 공지사항 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword 등
 * @returns {Promise}
 */
export const fetchClubs = async (params) => {
  try {
    const res = await api.get("/api/v1/club_articles", { params });
    return res;
  } catch (error) {
    console.error("API 호출 오류", error);
    throw error;
  }
};

/**
 * 동아리 공지사항 상세 조회
 * @param {number|string} id - 게시글 고유 ID
 * @returns {Promise}
 */
export const fetchClubDetail = async (id) => {
  try {
    const res = await api.get(`/api/v1/club_articles/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("동아리 상세 조회 실패:", error);
    throw error;
  }
};

// 마감임박 동아리 공지사항 목록 조회 (현재 미사용, 필요시 주석 해제)
// export const fetchImminentClubs = () => {
//   return api.get("/api/v1/deadline/club_articles");
// };
