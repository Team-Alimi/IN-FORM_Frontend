/**
 * [MOCK] src/api/main/calendar.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 캘린더 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchMonthlyAll : 해당 연/월에 걸쳐 있는 일정만 필터링하여 반환
 *                       (start_date <= 월말 && due_date >= 월초 인 항목)
 */
import { MOCK_CALENDAR_ARTICLES } from "@/mocks/data";

export const fetchMonthlyAll = async ({ calendarMonth }) => {
  const [yearStr, monthStr] = calendarMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const filtered = MOCK_CALENDAR_ARTICLES.filter((a) => {
    const start = new Date(a.start_date);
    const end = new Date(a.due_date);
    const targetStart = new Date(year, month - 1, 1);
    const targetEnd = new Date(year, month, 0);
    return start <= targetEnd && end >= targetStart;
  });

  return { articles: filtered };
};
