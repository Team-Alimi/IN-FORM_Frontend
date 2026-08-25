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
import { MOCK_SCHOOL_ARTICLES } from "@/mocks/data";

export const fetchMonthlyAll = async ({ calendarMonth }) => {
  const [yearStr, monthStr] = calendarMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  // YYYY-MM-DD 문자열은 사전순 비교 = 날짜 비교이므로 Date 변환 없이 비교
  const paddedMonth = String(month).padStart(2, "0");
  const targetStart = `${year}-${paddedMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // 해당 월 마지막 날 (로컬 기준, 일 계산용)
  const targetEnd = `${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}`;

  const filtered = MOCK_SCHOOL_ARTICLES.filter(
    (a) => a.start_date <= targetEnd && a.due_date >= targetStart
  );

  return { articles: filtered };
};
