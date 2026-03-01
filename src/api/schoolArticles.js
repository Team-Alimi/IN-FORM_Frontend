import api from "./axios";

/**
 * 학교 공지사항 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword, start_date, end_date 등
 * @returns {Promise}
 */
export const fetchEvents = async (params) => {
  try {
    const res = await api.get("/api/v1/school_articles", { params });
    return res;
  } catch (error) {
    console.error("행사 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 학교 공지사항 상세 조회
 * @param {number|string} id - 게시글 고유 ID
 * @returns {Promise}
 */
export const fetchEventDetail = async (id) => {
  try {
    const res = await api.get(`/api/v1/school_articles/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("행사 상세 조회 실패:", error);
    throw error;
  }
};

/**
 * 마감 임박 학교 공지사항 목록 조회
 * @returns {Promise}
 */
export const fetchImminentEvents = async () => {
  try {
    const res = await api.get("/api/v1/deadline/school_articles");
    return res;
  } catch (error) {
    console.error("마감임박 행사 조회 실패:", error);
    throw error;
  }
};
