import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMonthlyAll } from "@/api/main/calendar";

const STALE_TIME = 60 * 1000 * 10; // 10분

/**
 * 인접 월(이전/다음 달) 전체 일정을 미리 패치해 월 전환 시 즉시 렌더링
 * 카테고리가 동적으로 확장됨에 따라 per-category 프리패치를 제거하고 전체 조회만 유지
 */
export function useCalendarPrefetch(calendarMonth) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const [year, month] = calendarMonth.split("-").map(Number);

    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    const prevKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
    const nextKey = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

    [prevKey, nextKey].forEach((monthKey) => {
      queryClient.prefetchQuery({
        queryKey: ["monthlyAll", monthKey, [], false],
        queryFn: () => fetchMonthlyAll({ calendarMonth: monthKey }),
        staleTime: STALE_TIME,
      });
    });
  }, [calendarMonth, queryClient]);
}
