import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  parseDate,
  formatDateKey,
  formatMonthKey,
} from "@/utils/dateUtil";
import DaySelectEventList from "@/components/main/adaptive/feature/HOM/DaySelectEventList";
import { fetchMonthlyAll } from "@/api/main/calendar";
import { fetchCategories } from "@/api/main/vendors";
import { fetchEventDetail, fetchClubDetail } from "@/api/main/articles";
import MainCalendar from "@/components/main/adaptive/feature/HOM/MainCalendar";
import CalendarFilterBar from "@/components/main/adaptive/feature/HOM/CalendarFilterBar";
import CalendarFilterSheet from "@/components/main/adaptive/feature/HOM/CalendarFilterSheet";
import { useDeviceStore } from "@/stores/deviceStore";
import MobileEventDetail from "@/components/main/adaptive/feature/EVD/MobileEventDetail";
import { useCalendarPrefetch } from "@/hooks/useCalendarPrefetch";

const CalendarSection = ({ onTodayEventCount }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // 선택된 카테고리 ID 배열
  const [isMyDeptOnly, setIsMyDeptOnly] = useState(false);
  const [selectedDeadlineStatuses, setSelectedDeadlineStatuses] = useState([]); // 클라이언트 필터
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();

  // 바텀시트 관련 상태
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(() => {
    // 1. 초기 selectedDate : 오늘 날짜
    const today = new Date();
    return formatDateKey(today);
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return formatMonthKey(today); //'YYYY-MM' 형식
  });
  useCalendarPrefetch(calendarMonth);

  // 카테고리 목록 동적 조회
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 1000 * 60, // 1시간
  });
  const categories = categoriesData?.data || [];

  // React Query로 월간 일정 데이터 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["monthlyAll", calendarMonth, selectedCategoryIds, isMyDeptOnly],
    queryFn: () =>
      fetchMonthlyAll({
        calendarMonth,
        category_id: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        is_my_only: isMyDeptOnly || undefined,
      }),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
    placeholderData: keepPreviousData,
  });

  // 상세 데이터 페칭 (바텀시트용)
  const {
    data: detailData,
    isFetching: isDetailFetching,
  } = useQuery({
    queryKey: ["eventDetail", selectedEventId, selectedCategory],
    queryFn: () =>
      selectedCategory === "CLUB"
        ? fetchClubDetail(selectedEventId)
        : fetchEventDetail(selectedEventId),
    enabled: !!selectedEventId && isMobile, // ID가 있고 모바일인 경우에만 활성화
    staleTime: 60 * 1000 * 5,
  });

  // deadline_status 클라이언트 사이드 필터링
  const filteredArticles = useMemo(() => {
    const articles = data?.articles ?? [];
    if (selectedDeadlineStatuses.length === 0) return articles;
    return articles.filter((a) => selectedDeadlineStatuses.includes(a.deadline_status));
  }, [data, selectedDeadlineStatuses]);

  // 2. eventsByDate : 일별로 이벤트 매핑
  const eventsByDate = useMemo(() => {
    const eventMap = {};

    filteredArticles.forEach((article) => {
      const startDate = parseDate(article.starts_on);
      const endDate = parseDate(article.ends_on);
      if (!startDate || !endDate) return;
      // 필요한 데이터만 추출한 경량 객체 생성
      const SingleEvent = {
        id: article.id,
        title: article.title,
        category_name: article.categories?.[0]?.name || null,
        source_type: article.source_type,
        starts_on: article.starts_on,
        ends_on: article.ends_on,
      };
      // start_at부터 end_at까지 모든 날짜에 이벤트 추가
      const current = new Date(startDate);
      while (current <= endDate) {
        const key = formatDateKey(current); // "2025-11-01" 형식

        if (!eventMap[key]) {
          eventMap[key] = []; // 빈 배열 생성
        }
        eventMap[key].push(SingleEvent); // 경량 객체 추가
        // 다음 날로 이동
        current.setDate(current.getDate() + 1);
      }
    });
    return eventMap;
  }, [filteredArticles]);

  // 오늘 일정 개수를 부모(HOMPage)로 전달
  useEffect(() => {
    if (!onTodayEventCount) return;
    const todayKey = formatDateKey(new Date());
    const count = eventsByDate[todayKey]?.length ?? 0;
    onTodayEventCount(count);
  }, [eventsByDate, onTodayEventCount]);

  /******핸들러 핸들러 핸들러*******/
  const scrollToEventList = () => {
    const el = document.getElementById("event-list-section");
    if (el) {
      const rect = el.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + rect.top - 16, behavior: "smooth" });
    }
  };

  //1. 날짜 클릭 핸들러 - CalendarCell에서 전달받은 날짜 처리
  const handleDateClick = (date) => {
    const dateKey = formatDateKey(date); // Date 객체 → "2025-11-16"
    setCurrentDate(dateKey);
    scrollToEventList();
  };
  //2. Overflow 버튼 클릭 핸들러 (+n 클릭 시)
  const handleOverflowClick = (dateKey) => {
    setCurrentDate(dateKey);
    scrollToEventList();
  };

  // 월 변경 핸들러
  const handleMonthChange = (monthKey) => {
    // monthKey: "2025-10" 형식
    setCalendarMonth(monthKey);

    // 현재 선택된 날짜도 해당 월의 1일로 변경
    const [yearStr, monthStr] = monthKey.split("-");
    const newDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    setCurrentDate(formatDateKey(newDate));
  };

  // 바텀시트 닫기 핸들러
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  // 카테고리 칩 클릭 핸들러 (id: number | null)
  // null → 전체 선택(초기화), number → 해당 ID 토글
  const handleCategoryClick = (id) => {
    if (id === null) {
      setSelectedCategoryIds([]);
      return;
    }
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // 필터 바텀시트 적용 핸들러
  const handleFilterSheetApply = ({ categoryIds, deadlineStatuses }) => {
    setSelectedCategoryIds(categoryIds);
    setSelectedDeadlineStatuses(deadlineStatuses);
  };

  /**로딩 상태 처리*/
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }
  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">캘린더 데이터를 불러오지 못했습니다.</p>
        <button onClick={() => refetch()}>새로고침</button>
      </div>
    );
  }
  const handleArticleClick = (article_id, category) => {
    if (isMobile) {
      // 모바일: 바텀시트 열기
      setSelectedEventId(article_id);
      setSelectedCategory(category);
      setIsBottomSheetOpen(true);
    } else {
      // 데스크톱: 상세 페이지 이동
      if (category === "CLUB") {
        navigate(`/clubs/detail/${article_id}`);
      } else {
        navigate(`/events/detail/${article_id}`);
      }
    }
  };
  return (
    <div
      className={
        isMobile
          ? "flex flex-col gap-2 min-h-[500px] justify-between"
          : "flex flex-col gap-2 bg-white rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-4 pt-5 min-h-[500px] justify-between overflow-hidden"
      }
    >
      <div className="p-2">
        <MainCalendar
          currentMonth={calendarMonth}
          selectedDate={currentDate}
          eventsByDate={eventsByDate}
          onSelectDate={handleDateClick}
          onMonthChange={handleMonthChange}
          onOverflowClick={handleOverflowClick}
          onFilterOpen={() => setIsFilterSheetOpen(true)}
          filterBarSlot={
            <CalendarFilterBar
              categories={categories}
              selectedCategoryIds={selectedCategoryIds}
              onCategoryClick={handleCategoryClick}
              isMyDeptOnly={isMyDeptOnly}
              onMyDeptOnlyChange={setIsMyDeptOnly}
            />
          }
        />
      </div>
      <div className="border-t border-gray-200 max-mobile:block hidden" />
      <div className="mb-2 p-1 min-w-0">
        <DaySelectEventList
          events={eventsByDate[currentDate]}
          currentDate={currentDate}
          onArticleClick={handleArticleClick}
        />
      </div>

      {/* 모바일용 상세 정보 바텀시트 */}
      {isMobile && (
        <MobileEventDetail
          key={selectedEventId}
          isFetching={isDetailFetching}
          isOpen={isBottomSheetOpen}
          onClose={handleCloseBottomSheet}
          articleId={selectedEventId}
          status={detailData?.deadline_status}
          title={detailData?.title}
          vendors={detailData?.vendors}
          startDate={detailData?.starts_on}
          dueDate={detailData?.ends_on}
          created_at={detailData?.published_at}
          content={detailData?.content}
          category_name={detailData?.categories?.[0]?.name}
          is_bookmarked={detailData?.is_bookmarked}
          bookmark_count={detailData?.bookmark_count}
        />
      )}

      {/* 캘린더 필터 바텀시트 */}
      <CalendarFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        selectedDeadlineStatuses={selectedDeadlineStatuses}
        onApply={handleFilterSheetApply}
      />
    </div>
  );
};
export default CalendarSection;
