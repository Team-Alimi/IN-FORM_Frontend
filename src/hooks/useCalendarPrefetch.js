import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMonthlyAll } from "@/api/getMonthlyAll";
import { FILTER_OPTIONS } from "@/constants/filterOption";

const STALE_TIME = 60 * 1000 * 10; // 10분

export function useCalendarPrefetch(calendarMonth) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // CONTEST는 CalendarSection의 useQuery가 직접 fetch하므로 제외
    FILTER_OPTIONS.forEach((option) => {
      if (option.key === "CONTEST") return;

      // CalendarSection의 useQuery queryKey와 정확히 동일한 형식
      const filterKey = [option.key]; // e.g. ["LECTURE"]

      const category_id = option.category_id ? [option.category_id] : undefined;
      const is_my_only = option.key === "MY" ? true : undefined;

      queryClient.prefetchQuery({
        queryKey: ["monthlyAll", calendarMonth, filterKey],
        queryFn: () =>
          getMonthlyAll({ calendarMonth, category_id, is_my_only }),
        staleTime: STALE_TIME,
      });
    });
  }, [calendarMonth, queryClient]);
}
