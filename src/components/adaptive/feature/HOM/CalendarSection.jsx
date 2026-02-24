import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  parseDate,
  formatDateKey,
  formatMonthKey,
} from "../../../../utils/dateUtil";
import DaySelectEventList from "./DaySelectEventList";
import { getMonthlyAll } from "../../../../api/getMonthlyAll";
import ErrorPage from "../../../../pages/NOT/ErrorPage";
import MainCalendar from "./MainCalendar";
import CalendarFilterBar from "./CalendarFilterBar";
import CalendarLogo from "../../../../assets/icons/calendarLogo.png";
import { useDeviceStore } from "../../../../stores/deviceStore";

const CalendarSection = () => {
  const [selectedFilter, setSelectedFilter] = useState(["CONTEST"]);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const eventListRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(() => {
    // 1. 초기 selectedDate : 오늘 날짜
    const today = new Date();
    return formatDateKey(today);
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return formatMonthKey(today); //'YYYY-MM' 형식
  });

  // React Query로 API 데이터 가져오기
  const { data, isLoading, error } = useQuery({
    queryKey: ["monthlyAll", calendarMonth], // calendarMonth가 바뀌면 재요청
    queryFn: () => getMonthlyAll({ calendarMonth }),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
  });

  // API 데이터가 로드되면 사용, 아니면 빈 배열
  const events = data || { articles: [] };
  // 2. eventsByDate : 일별로 이벤트 매핑
  const eventsByDate = useMemo(() => {
    const eventMap = {};

    events.articles.forEach((article) => {
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
    console.log(eventMap);
    return eventMap;
  }, [events]); // events가 변경될 때만 재계산

  // 3. filteredEventsByDate : selectedFilter 기반 필터링
  const filteredEventsByDate = useMemo(() => {
    if (selectedFilter.length === 0) return eventsByDate;
    return Object.fromEntries(
      Object.entries(eventsByDate)
        .map(([date, evts]) => [
          date,
          evts.filter((e) => selectedFilter.includes(e.category_name)),
        ])
        .filter(([, evts]) => evts.length > 0),
    );
  }, [eventsByDate, selectedFilter]);

  /******핸들러 핸들러 핸들러*******/
  //1. 날짜 클릭 핸들러 - CalendarCell에서 전달받은 날짜 처리
  const handleDateClick = (date) => {
    const dateKey = formatDateKey(date); // Date 객체 → "2025-11-16"
    setCurrentDate(dateKey);
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

  //3. 월 변경 핸들러 - MainCalendar에서 호출
  const handleMonthChange = (monthKey) => {
    // monthKey: "2025-10" 형식
    setCalendarMonth(monthKey);

    // 현재 선택된 날짜도 해당 월의 1일로 변경
    const [yearStr, monthStr] = monthKey.split("-");
    const newDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    setCurrentDate(formatDateKey(newDate));
  };
  //4. 필터 토글 핸들러
  const handleFilterClick = (key) => {
    setSelectedFilter((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
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
    return <ErrorPage />;
  }
  const handleArticleClick = (article_id, category) => {
    if (category === "CLUB") {
      navigate(`/clubs/detail/${article_id}`);
    } else {
      navigate(`/events/detail/${article_id}`);
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
      <div className="flex flex-row gap-4 items-center mx-4 pt-1">
        <img src={CalendarLogo} className="w-8 h-8" />
        <div className="flex flex-col">
          <div className="font-bold text-md text-gray-800">일정 캘린더</div>
          <div className="font-medium text-xs text-gray-700">
            Schedule Caldendar
          </div>
        </div>
      </div>

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
          eventsByDate={filteredEventsByDate}
          onSelectDate={handleDateClick}
          onMonthChange={handleMonthChange}
          onOverflowClick={handleOverflowClick}
        />
      </div>
      <div className="mb-2 p-1">
        <DaySelectEventList
          ref={eventListRef}
          events={filteredEventsByDate[currentDate]}
          currentDate={currentDate}
          onArticleClick={handleArticleClick}
        />
      </div>
    </div>
  );
};
export default CalendarSection;
