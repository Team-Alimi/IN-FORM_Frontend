import instance from "@/api/axios";

/**
 * 특정 연/월의 학교 공지사항 일정 요약 조회 (개편된 API 명세 반영)
 * @param {Object} params - year, month, category_id, is_my_only 등
 * @returns {Promise}
 */
export async function getMonthlyAll({
  calendarMonth,
  category_id,
  is_my_only,
}) {
  // calendarMonth: 'YYYY-MM' 형식
  const [yearStr, monthStr] = calendarMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  try {
    const res = await instance.get("/api/v1/calendar/notices", {
      params: {
        year,
        month,
        category_id: category_id?.length > 0 ? category_id.join(",") : undefined,
        is_my_only: is_my_only || undefined,
      },
    });
    // 응답 데이터는 res.data.data (일정 리스트)
    return { articles: res.data.data };
  } catch (error) {
    console.error("[API] 에러 발생:", error);
    throw error;
  }
}
