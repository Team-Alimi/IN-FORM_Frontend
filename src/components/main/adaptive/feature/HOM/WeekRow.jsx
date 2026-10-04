import CalendarCell from '@/components/main/adaptive/feature/HOM/CalendarCell';
import { isSameDate, parseDate, formatDateKey } from '@/utils/dateUtil';
import {
  CATEGORY_NAME_COLOR_MAP,
  CATEGORY_CODE_TO_NAME_MAP,
  DEFAULT_CATEGORY_COLOR,
} from '@/constants/filterOption';

const WeekRow = ({ week, eventsByDate, today, selectedDate, onSelectDate }) => {
  const selectedDateObj = selectedDate ? parseDate(selectedDate) : null;

  return (
    <div className="pb-2">
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 text-center text-base sm:text-lg md:text-xl">
        {week.map((cellData, j) => {
          if (!cellData) return <div key={j} />;

          const { date, inCurrentMonth } = cellData;
          const isToday = inCurrentMonth && isSameDate(date, today);
          const isSelected =
            selectedDateObj && isSameDate(date, selectedDateObj);

          return (
            <div key={j} className="flex flex-col items-center">
              <CalendarCell
                date={date}
                inCurrentMonth={inCurrentMonth}
                isToday={isToday}
                isSelected={isSelected}
                onClick={onSelectDate}
                isMini={false}
              />
              <div
                aria-hidden="true"
                className="flex h-4 items-center justify-center gap-0.5"
              >
                {inCurrentMonth &&
                  [
                    ...new Set(
                      (eventsByDate[formatDateKey(date)] ?? []).map(
                        (event) =>
                          event.source_type === 'CLUB'
                            ? '동아리'
                            : (CATEGORY_CODE_TO_NAME_MAP[event.category_name] ??
                              event.category_name) || '기타'
                      )
                    ),
                  ]
                    .slice(0, 3)
                    .map((name) => {
                      const color =
                        CATEGORY_NAME_COLOR_MAP[
                          CATEGORY_CODE_TO_NAME_MAP[name] ?? name
                        ] ?? DEFAULT_CATEGORY_COLOR;
                      return (
                        <span
                          key={name ?? 'other'}
                          className={`h-1 w-1 rounded-full ${color.dot}`}
                        />
                      );
                    })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekRow;
