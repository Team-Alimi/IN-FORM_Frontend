import api from "@/api/axios";

/**
 * 특정 연/월의 학교 공지사항 일정 요약 조회
 * @param {Object} params
 * @param {string} params.calendarMonth - 'YYYY-MM' 형식
 * @param {Array} params.category_id - 카테고리 ID 배열 (옵션)
 * @param {boolean} params.is_my_only - 내 학과만 보기 여부 (옵션)
 * @returns {Promise<{articles: Array}>}
 */
export async function getMonthlyAll({ calendarMonth, category_id, is_my_only }) {
  const [yearStr, monthStr] = calendarMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  try {
    const res = await api.get("/api/v1/calendar/notices", {
      params: {
        year,
        month,
        category_id: category_id?.length > 0 ? category_id.join(",") : undefined,
        is_my_only: is_my_only || undefined,
      },
    });
    return { articles: res.data.data };
  } catch (error) {
    console.error("[API] 에러 발생:", error);
    throw error;
  }
}
