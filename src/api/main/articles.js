import api from "@/api/axios";

// ─── 학교 공지사항 ─────────────────────────────────────────────────────────────

/**
 * 학교 공지사항 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword, starts_from, ends_to, category_id, interest_only, has_deadline, sort
 * @returns {Promise}
 */
export const fetchEvents = async (params) => {
  try {
    const res = await api.get("/api/v1/articles", {
      params: { ...params, source_type: "SCHOOL" },
    });
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
    const res = await api.get(`/api/v1/articles/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("행사 상세 조회 실패:", error);
    throw error;
  }
};

/**
 * 인기 공지사항 목록 조회 (북마크 수 기준)
 * @param {number} limit - 조회 개수 (기본 5, 최대 20)
 * @returns {Promise}
 */
export const fetchHotEvents = async (limit = 5) => {
  try {
    const res = await api.get("/api/v1/articles/popular", {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    console.error("[API] 에러 발생:", error);
    throw error;
  }
};

// ─── 동아리 공지사항 ───────────────────────────────────────────────────────────

/**
 * 동아리 공지사항 목록 조회
 * @param {Object} params - page, size, vendor_id, keyword 등
 * @returns {Promise}
 */
export const fetchClubs = async (params) => {
  try {
    const res = await api.get("/api/v1/articles", {
      params: { ...params, source_type: "CLUB" },
    });
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
    const res = await api.get(`/api/v1/articles/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("동아리 상세 조회 실패:", error);
    throw error;
  }
};
