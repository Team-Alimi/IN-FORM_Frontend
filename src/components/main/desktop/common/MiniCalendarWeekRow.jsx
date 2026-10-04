import CalendarCell from '@/components/main/adaptive/feature/HOM/CalendarCell';
import { isSameDate, parseDate } from '@/utils/dateUtil';

const MiniCalendarWeekRow = ({ week, today, selectedDate, onSelectDate }) => {
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
