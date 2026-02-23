// 미니 캘린더와 거의 유사
import React, { useMemo } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import WeekRow from "./WeekRow";
import { generateWeeks } from "../../../../utils/calendarUtil";

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

const MainCalendar = ({
  currentMonth, // "2025-11" 형식
  selectedDate,
  eventsByDate,
  onSelectDate,
  onMonthChange,
  onOverflowClick,
}) => {
  // currentMonth prop으로부터 year, month 추출
  const [yearStr, monthStr] = currentMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // "11" → 10 (0-based)
  // 3. 오늘 날짜 (고정) -- 필수는 아닌것 같기도
  const today = useMemo(() => new Date(), []);

  // 3. weeks 계산 - calendarUtil 사용
  const weeks = useMemo(() => generateWeeks(year, month), [year, month]);

  // 4. 이전/다음 달 이동 - 부모에게 알림만
  const goPrevMonth = () => {
    let newYear = year;
    let newMonth = month; // 0-based (0~11)

    if (newMonth === 0) {
      newYear = year - 1;
      newMonth = 11;
    } else {
      newMonth = month - 1;
    }

    // "YYYY-MM" 형식으로 바로 전달
    const monthKey = `${newYear}-${String(newMonth + 1).padStart(2, "0")}`;
    onMonthChange(monthKey);
  };

  const goNextMonth = () => {
    let newYear = year;
    let newMonth = month; // 0-based (0~11)

    if (newMonth === 11) {
      newYear = year + 1;
      newMonth = 0;
    } else {
      newMonth = month + 1;
    }

    // "YYYY-MM" 형식으로 바로 전달
    const monthKey = `${newYear}-${String(newMonth + 1).padStart(2, "0")}`;
    onMonthChange(monthKey);
  };

  return (
    <div className="w-full rounded-2xl bg-white p-5 sm:p-8 md:p-10 max-mobile:p-1">
      {/* 상단: 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4 md:mb-5 max-mobile:mb-1">
        <button
          type="button"
          onClick={goPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoChevronBackOutline className="text-gray-500 text-lg sm:text-xl" />
        </button>

        <div className="text-base sm:text-base md:text-lg font-semibold text-gray-800">
          {year}년 {month + 1}월
        </div>

        <button
          type="button"
          onClick={goNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoChevronForwardOutline className="text-gray-500 text-lg sm:text-xl" />
        </button>
      </div>
      <div className="border-b border-gray-200 mb-4 md:mb-5 max-mobile:mb-2" />
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-sm sm:text-base mb-2 md:mb-3 max-mobile:mb-1">
        {dayLabels.map((label, idx) => (
          <div
            key={idx}
            className={
              idx === 0
                ? "text-red-500 font-medium"
                : idx === 6
                  ? "text-blue-500 font-medium"
                  : "text-gray-400 font-medium"
            }
          >
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-0 sm:space-y-1">
        {weeks.map((week, i) => (
          <WeekRow
            key={i}
            week={week}
            eventsByDate={eventsByDate}
            today={today}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onOverflowClick={onOverflowClick}
          />
        ))}
      </div>
    </div>
  );
};

export default MainCalendar;
