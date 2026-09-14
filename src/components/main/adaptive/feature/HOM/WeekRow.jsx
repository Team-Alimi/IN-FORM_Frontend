import { useMemo } from "react";
import CalendarCell from "@/components/main/adaptive/feature/HOM/CalendarCell";
import EventBar from "@/components/main/adaptive/feature/HOM/EventBar";
import OverflowButton from "@/components/main/adaptive/feature/HOM/OverflowButton";
import {
  collectUniqueEvents,
  buildBars,
  assignRows,
  filterByColumnLimit,
} from "@/utils/calendarUtil";
import { isSameDate, parseDate } from "@/utils/dateUtil";

const WeekRow = ({
  week,
  eventsByDate,
  today,
  selectedDate,
  onSelectDate,
  onOverflowClick,
}) => {
  const { eventBars, overflows } = useMemo(
    () => calcEventBarsForWeek(week, eventsByDate),
    [week, eventsByDate],
  );

  const maxRow =
    eventBars.length > 0 ? Math.max(...eventBars.map((b) => b.row)) : -1;

  // selectedDate 문자열 → Date 객체로 변환
  const selectedDateObj = selectedDate ? parseDate(selectedDate) : null;

  return (
    <div className="mb-1 sm:mb-2 max-mobile:m-0.5">
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
              isMini={false}
            />
          );
        })}
      </div>

      {/* 이벤트 바들 */}
      {eventBars.length > 0 && (
        <div
          className="grid grid-cols-7 gap-x-0 gap-y-1 max-mobile:gap-y-0.5 mt-1 px-1"
          style={{
            gridTemplateRows: `repeat(${maxRow + 1}, minmax(var(--event-bar-row-height), auto))`,
          }}
        >
          {eventBars.map((bar) => (
            <EventBar
              key={bar.event.article_id}
              event={bar.event}
              startCol={bar.startCol}
              span={bar.span}
              row={bar.row}
              isMini={false}
            />
          ))}
        </div>
      )}

      {/* Overflow 버튼들 (+n) */}
      {overflows.length > 0 && (
        <div className="grid grid-cols-7 gap-x-0 mt-1 px-1">
          {week.map((cellData, dayIndex) => {
            const overflow = overflows.find((o) => o.dayIndex === dayIndex);
            return (
              <div key={dayIndex} className="flex justify-center">
                {overflow && (
                  <OverflowButton
                    count={overflow.count}
                    dateKey={overflow.dateKey}
                    onOverflowClick={onOverflowClick}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeekRow;

function calcEventBarsForWeek(week, eventsByDate) {
  const uniqueEvents = collectUniqueEvents(week, eventsByDate); // 중복 제거된 이벤트 수집
  const bars = buildBars(week, uniqueEvents); // 이벤트 바 생성 (이미 span 순으로 정렬됨)

  // 각 날짜별로 표시할 이벤트 결정
  const MAX_VISIBLE_ROWS = 4;
  const { visibleBars, overflows } = filterByColumnLimit(
    week,
    bars,
    MAX_VISIBLE_ROWS,
  );

  // 표시할 이벤트들에 대해서만 행 할당
  assignRows(visibleBars);

  return { eventBars: visibleBars, overflows };
}
