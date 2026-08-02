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
