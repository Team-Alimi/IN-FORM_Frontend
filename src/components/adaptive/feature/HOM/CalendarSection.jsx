import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  parseDate,
  formatDateKey,
  formatMonthKey,
} from "../../../../utils/dateUtil";
import DaySelectEventList from "./DaySelectEventList";
import { getMonthlyAll } from "../../../../api/getMonthlyAll";
import { fetchEventDetail } from "../../../../api/schoolArticles";
import { fetchClubDetail } from "../../../../api/clubArticles";

import MainCalendar from "./MainCalendar";
import CalendarFilterBar from "./CalendarFilterBar";
import { useDeviceStore } from "../../../../stores/deviceStore";
import MobileEventDetail from "../EVD/MobileEventDetail";
import { FILTER_OPTIONS } from "../../../../constants/filterOption";
import { useCalendarPrefetch } from "../../../../hooks/useCalendarPrefetch";
import SectionTitle from "../../../mobile/common/SectionTitle";

const CalendarSection = () => {
  const [selectedFilter, setSelectedFilter] = useState(["CONTEST"]);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const eventListRef = useRef(null);

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
  // selectedFilter key → category_id 변환 (MY 제외)
  const categoryIds = selectedFilter
    .filter((key) => key !== "MY")
    .map((key) => FILTER_OPTIONS.find((opt) => opt.key === key)?.category_id)
    .filter(Boolean);
  const isMyOnly = selectedFilter.includes("MY") || undefined;

  // React Query로 월간 일정 데이터 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["monthlyAll", calendarMonth, selectedFilter], // 필터 변경 시 재요청
    queryFn: () =>
      getMonthlyAll({
        calendarMonth,
        category_id: categoryIds,
        is_my_only: isMyOnly,
      }),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
    placeholderData: keepPreviousData,
  });

  // 상세 데이터 페칭 (바텀시트용)
  const {
    data: detailData,
    isLoading: isDetailLoading,
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

  // 2. eventsByDate : 일별로 이벤트 매핑
  const eventsByDate = useMemo(() => {
    const eventMap = {};
    const articles = data?.articles ?? [];

    articles.forEach((article) => {
      const startDate = parseDate(article.start_date);
      const endDate = parseDate(article.due_date);
      if (!startDate || !endDate) return;
      // 필요한 데이터만 추출한 경량 객체 생성
      const SingleEvent = {
        article_id: article.article_id,
        title: article.title,
        category_name: article.categories?.category_name || null,
        start_date: article.start_date,
        due_date: article.due_date,
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
  }, [data]); // data가 변경될 때만 재계산

  /******핸들러 핸들러 핸들러*******/
  //1. 날짜 클릭 핸들러 - CalendarCell에서 전달받은 날짜 처리
  const handleDateClick = (date) => {
    const dateKey = formatDateKey(date); // Date 객체 → "2025-11-16"
    setCurrentDate(dateKey);

    if (eventListRef.current) {
      eventListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  //2. Overflow 버튼 클릭 핸들러 (+n 클릭 시)
  const handleOverflowClick = (dateKey) => {
    // 1. 날짜 선택
    setCurrentDate(dateKey);

    // 2. 이벤트 리스트로 스크롤
    if (eventListRef.current) {
      eventListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
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

  // 4. 바텀시트 닫기 핸들러
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    // 닫힐 때 선택된 ID 초기화 (선택 사항, 애니메이션 고려하여 유지 가능)
    // setSelectedEventId(null);
  };
  //4. 필터 토글 핸들러 (MY는 단독 선택, 카테고리 필터와 상호 배타적)
  const handleFilterClick = (key) => {
    setSelectedFilter((prev) => {
      if (key === "MY") {
        // MY 토글: 이미 선택됐으면 해제, 아니면 MY만 단독 선택
        return prev.includes("MY") ? prev.filter((f) => f !== "MY") : ["MY"];
      }
      // 카테고리 필터 클릭 시: MY 제거 후 해당 필터 토글
      const withoutMY = prev.filter((f) => f !== "MY");
      if (withoutMY.includes(key)) {
        return withoutMY.filter((f) => f !== key);
      }
      return [...withoutMY, key];
    });
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
          ? "flex flex-col gap-2 bg-[#F4F8FE] rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-4 min-h-[500px] justify-between"
          : "flex flex-col gap-2 bg-white rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-4 pt-5 min-h-[500px] justify-between"
      }
    >
      <SectionTitle
        KoreanTitle={"일정 캘린더"}
        EnglishTitle={"Schedule Calendar"}
      />
      <div className="mt-2 mx-2">
        <CalendarFilterBar
          selectedFilter={selectedFilter}
          onClick={handleFilterClick}
        />
      </div>

      <div className="p-2">
        <MainCalendar
          currentMonth={calendarMonth}
          selectedDate={currentDate}
          eventsByDate={eventsByDate}
          onSelectDate={handleDateClick}
          onMonthChange={handleMonthChange}
          onOverflowClick={handleOverflowClick}
        />
      </div>
      <div className="mb-2 p-1">
        <DaySelectEventList
          ref={eventListRef}
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
          status={detailData?.status}
          title={detailData?.title}
          vendors={detailData?.vendors}
          startDate={detailData?.start_date}
          dueDate={detailData?.due_date}
          created_at={detailData?.created_at}
          content={detailData?.content}
          category_name={detailData?.categories?.category_name}
          is_bookmarked={detailData?.is_bookmarked}
          bookmark_count={detailData?.bookmark_count}
        />
      )}
    </div>
  );
};
export default CalendarSection;
