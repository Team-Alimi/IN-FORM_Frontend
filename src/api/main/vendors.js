import api from "@/api/axios";

/**
 * 전체 또는 타입별 제공처(Vendor) 조회
 * @param {string} type - "SCHOOL" | "CLUB" (옵션)
 * @returns {Promise}
 */
export async function fetchVendors(type) {
  try {
    const res = await api.get("/api/v1/vendors", {
      params: type ? { type } : undefined,
    });
    return res.data;
  } catch (error) {
    console.error("[API] fetchVendors 에러 발생:", error);
    throw error;
  }
}

/**
 * 공지 분류(카테고리) 목록 조회 — 관리자가 지정한 노출 순서대로
 * @returns {Promise<Object>} { success, data: [{ id, name, sort_order }] }
 */
export async function fetchCategories() {
  try {
    const res = await api.get("/api/v1/categories");
    return res.data;
  } catch (error) {
    console.error("[API] fetchCategories 에러 발생:", error);
    throw error;
  }
}

/**
 * 동아리 유형 목록 조회 — 활성 유형만, sort_order 오름차순
 * @returns {Promise<Object>} { success, data: [{ id, name, sort_order }] }
 */
export async function fetchClubTypes() {
  try {
    const res = await api.get("/api/v1/club-types");
    return res.data;
  } catch (error) {
    console.error("[API] fetchClubTypes 에러 발생:", error);
    throw error;
  }
}
