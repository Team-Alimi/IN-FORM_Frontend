import api from "./axios";

/**
 * 이벤트/행사 목록 조회
 * @param {Object} params - page, category, search, size 등
 * @returns {Promise}
 */
export const fetchEvents = (params) => {
  return api.get("/api/v1/school_articles", { params });
};

/**
 * 마감 임박 행사 목록 조회
 * @returns {Promise}
 */
export const fetchImminentEvents = () => {
  return api.get("/api/v1/deadline/school_articles");
};
