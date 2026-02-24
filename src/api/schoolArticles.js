import api from "./axios";

/**
 * 학교 공지사항 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword, start_date, end_date 등
 * @returns {Promise}
 */
export const fetchEvents = (params) => {
  return api.get("/api/v1/school_articles", { params });
};

/**
 * 학교 공지사항 상세 조회
 * @param {number|string} id - 게시글 고유 ID
 * @returns {Promise}
 */
export const fetchEventDetail = async (id) => {
  const res = await api.get(`/api/v1/school_articles/${id}`);
  return res.data.data;
};

/**
 * 마감 임박 학교 공지사항 목록 조회
 * @returns {Promise}
 */
export const fetchImminentEvents = () => {
  return api.get("/api/v1/deadline/school_articles");
};
