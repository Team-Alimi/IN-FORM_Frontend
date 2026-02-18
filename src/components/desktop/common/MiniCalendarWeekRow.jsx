import { useMemo } from "react";
import CalendarCell from "../../adaptive/feature/HOM/CalendarCell";
import EventBar from "../../adaptive/feature/HOM/EventBar";
import OverflowButton from "../../adaptive/feature/HOM/OverflowButton";
import {
  collectUniqueEvents,
  buildBars,
  assignRows,
  filterByColumnLimit,
} from "../../../utils/calendarUtil";
import { isSameDate, parseDate } from "../../../utils/dateUtil";

const MiniCalendarWeekRow = ({
  week,
  eventsByDate,
  today,
  selectedDate,
  onSelectDate,
}) => {
  const { eventBars, overflows } = useMemo(
    () => calcEventBarsForWeek(week, eventsByDate),
    [week, eventsByDate]
  );

  const maxRow =
    eventBars.length > 0 ? Math.max(...eventBars.map((b) => b.row)) : -1;

  // selectedDate 문자열 → Date 객체로 변환
  const selectedDateObj = selectedDate ? parseDate(selectedDate) : null;

  return (
    <div className="mb-1 sm:mb-2">
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 text-center text-base sm:text-lg md:text-xl">
        {week.map((cellData, j) => {
          if (!cellData) return <div key={j} />;

          const { date, inCurrentMonth } = cellData;
          const isToday = inCurrentMonth && isSameDate(date, today);
          const isSelected =
            selectedDateObj && isSameDate(date, selectedDateObj);

          return (
            <CalendarCell
              key={j}
              date={date}
              inCurrentMonth={inCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              onClick={onSelectDate}
              isMini={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendarWeekRow;

function calcEventBarsForWeek(week, eventsByDate) {
  const uniqueEvents = collectUniqueEvents(week, eventsByDate); // 중복 제거된 이벤트 수집
  const bars = buildBars(week, uniqueEvents); // 이벤트 바 생성 (이미 span 순으로 정렬됨)

  // 각 날짜별로 표시할 이벤트 결정
  const MAX_VISIBLE_ROWS = 4;
  const { visibleBars, overflows } = filterByColumnLimit(
    week,
    bars,
    MAX_VISIBLE_ROWS
  );

  // 표시할 이벤트들에 대해서만 행 할당
  assignRows(visibleBars);

  return { eventBars: visibleBars, overflows };
}
