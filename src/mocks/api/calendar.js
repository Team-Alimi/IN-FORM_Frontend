/**
 * [MOCK] src/api/main/calendar.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 캘린더 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchMonthlyAll : 해당 연/월에 걸쳐 있는 일정만 필터링하여 반환
 *                       (starts_on <= 월말 && ends_on >= 월초 인 항목)
 *                       is_my_only=true 시 사용자 관심학과 vendor_id로 추가 필터링
 */
import { MOCK_SCHOOL_ARTICLES } from "@/mocks/data";
import useAuthStore from "@/stores/useAuthStore";

export const fetchMonthlyAll = async ({ calendarMonth, category_id, is_my_only }) => {
  const [yearStr, monthStr] = calendarMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  // YYYY-MM-DD 문자열은 사전순 비교 = 날짜 비교이므로 Date 변환 없이 비교
  const paddedMonth = String(month).padStart(2, "0");
  const targetStart = `${year}-${paddedMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const targetEnd = `${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}`;

  let filtered = MOCK_SCHOOL_ARTICLES.filter(
    (a) => a.starts_on <= targetEnd && a.ends_on >= targetStart
  );

  // 카테고리 필터링: category_id 배열이 비어있지 않으면 해당 카테고리만 반환
  if (category_id && category_id.length > 0) {
    filtered = filtered.filter((a) =>
      a.categories?.some((c) => category_id.includes(c.id))
    );
  }

  // 관심학과만 보기: 사용자의 관심학과 vendor_id에 해당하는 항목만 반환
  if (is_my_only) {
    const { userInfo } = useAuthStore.getState();
    const userMajorId = userInfo?.major?.vendor_id;
    if (userMajorId) {
      filtered = filtered.filter((a) =>
        a.vendors?.some((v) => v.id === userMajorId)
      );
    }
  }

  return { articles: filtered };
};
