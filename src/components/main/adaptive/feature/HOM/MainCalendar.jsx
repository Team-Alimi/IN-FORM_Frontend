// 미니 캘린더와 거의 유사
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import { RiEqualizerLine } from 'react-icons/ri';
import WeekRow from '@/components/main/adaptive/feature/HOM/WeekRow';
import { generateWeeks } from '@/utils/calendarUtil';
import { useDeviceStore } from '@/stores/deviceStore';
import { getHomeWeek, shiftHomeDate } from '@/utils/homeCalendar';

const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

const MainCalendar = ({
  currentMonth, // "2025-11" 형식
  selectedDate,
  eventsByDate,
  onSelectDate,
  onMonthChange,
  onFilterOpen,
  filterBarSlot,
  viewMode = 'month',
}) => {
  const isMobile = useDeviceStore((state) => state.isMobile);

  // currentMonth prop으로부터 year, month 추출
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // "11" → 10 (0-based)
  // 3. 오늘 날짜 (고정) -- 필수는 아닌것 같기도
  const today = useMemo(() => new Date(), []);

  // 3. weeks 계산 - calendarUtil 사용
  const weeks = useMemo(
    () =>
      generateWeeks(year, month, 1).filter((week) =>
        week.some((cell) => cell.inCurrentMonth)
      ),
    [year, month]
  );
  const selectedWeek = getHomeWeek(selectedDate);
  const weekStart = selectedWeek[0].date;
  const weekEnd = selectedWeek[6].date;
  const weekNumber =
    Math.floor(
      (Number(selectedDate.slice(-2)) -
        1 +
        ((new Date(year, month, 1).getDay() + 6) % 7)) /
        7
    ) + 1;
  const weekLabel = `${month + 1}월 ${weekNumber}주차 (${weekStart.getMonth() + 1}.${weekStart.getDate()} ~ ${weekEnd.getMonth() + 1}.${weekEnd.getDate()})`;
  const handleWeekChange = (delta) => {
    const [y, m, d] = shiftHomeDate(selectedDate, delta * 7)
      .split('-')
      .map(Number);
    onSelectDate(new Date(y, m - 1, d));
  };

  // 모바일 전용: 월 선택 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  // 드롭다운에서 년도 변경
  const handleYearChange = (delta) => {
    const newYear = year + delta;
    const monthKey = `${newYear}-${String(month + 1).padStart(2, '0')}`;
    onMonthChange(monthKey);
  };

  // 드롭다운에서 월 선택
  const handleMonthSelect = (m) => {
    const monthKey = `${year}-${String(m).padStart(2, '0')}`;
    onMonthChange(monthKey);
    setIsDropdownOpen(false);
  };

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
    const monthKey = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
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
    const monthKey = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
    onMonthChange(monthKey);
  };

  return (
    <div
      data-calendar-view={viewMode}
      className="w-full rounded-2xl bg-white p-5 sm:p-8 md:p-10 max-mobile:p-1"
    >
      {/* 상단: 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4 md:mb-5 max-mobile:mb-2">
        {isMobile ? (
          // 모바일: 드롭다운 방식 + 필터 아이콘
          <>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1 font-bold text-gray-900 ${viewMode === 'week' ? 'text-[13px]' : 'text-[17px]'}`}
              >
                {viewMode === 'week' ? weekLabel : `${month + 1}월`}
                <IoChevronDownOutline
                  className={`text-gray-600 text-base transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 z-20 mt-2 bg-white shadow-xl rounded-2xl p-3 min-w-[196px] border border-gray-100">
                  {/* 년도 네비게이션 */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <button
                      type="button"
                      onClick={() => handleYearChange(-1)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <IoChevronBackOutline className="text-gray-500 text-sm" />
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                      {year}년
                    </span>
                    <button
                      type="button"
                      onClick={() => handleYearChange(+1)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <IoChevronForwardOutline className="text-gray-500 text-sm" />
                    </button>
                  </div>
                  {/* 1~12월 그리드 */}
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMonthSelect(m)}
                        className={`py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${
                            m === month + 1
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {m}월
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 필터 아이콘 버튼 */}
            <div className="flex items-center">
              {viewMode === 'week' && (
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="이전 주"
                    onClick={() => handleWeekChange(-1)}
                    className="p-2 text-gray-400"
                  >
                    <IoChevronBackOutline />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 주"
                    onClick={() => handleWeekChange(1)}
                    className="p-2 text-gray-400"
                  >
                    <IoChevronForwardOutline />
                  </button>
                </div>
              )}
              {onFilterOpen && (
                <button
                  type="button"
                  onClick={onFilterOpen}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                  aria-label="필터"
                >
                  <RiEqualizerLine className="text-xl" />
                </button>
              )}
            </div>
          </>
        ) : (
          // 데스크톱: 기존 이전/다음 버튼 방식 + 필터 아이콘
          <>
            <button
              type="button"
              onClick={
                viewMode === 'week' ? () => handleWeekChange(-1) : goPrevMonth
              }
              aria-label={viewMode === 'week' ? '이전 주' : '이전 달'}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoChevronBackOutline className="text-gray-500 text-lg sm:text-xl" />
            </button>

            <div className="flex items-center gap-2">
              <div className="text-base sm:text-base md:text-lg font-semibold text-gray-800">
                {viewMode === 'week' ? weekLabel : `${year}년 ${month + 1}월`}
              </div>
              {/* 필터 아이콘 버튼 */}
              {onFilterOpen && (
                <button
                  type="button"
                  onClick={onFilterOpen}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                  aria-label="필터"
                >
                  <RiEqualizerLine className="text-lg" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={
                viewMode === 'week' ? () => handleWeekChange(1) : goNextMonth
              }
              aria-label={viewMode === 'week' ? '다음 주' : '다음 달'}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoChevronForwardOutline className="text-gray-500 text-lg sm:text-xl" />
            </button>
          </>
        )}
      </div>
      {filterBarSlot && <div className="mt-2 mb-3 mx-1">{filterBarSlot}</div>}
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-sm sm:text-base mb-2 md:mb-3 max-mobile:mb-1">
        {dayLabels.map((label, idx) => (
          <div
            key={idx}
            className={
              idx === 6
                ? 'text-red-500 font-medium'
                : idx === 5
                  ? 'text-blue-500 font-medium'
                  : 'text-gray-400 font-medium'
            }
          >
            {label}
          </div>
        ))}
      </div>

      <div>
        {weeks.map((week, i) => {
          const isSelectedWeek = week[0].date.getTime() === weekStart.getTime();
          const visible = viewMode === 'month' || isSelectedWeek;
          return (
            <div
              key={i}
              data-calendar-week={visible ? '' : undefined}
              aria-hidden={!visible}
              inert={!visible ? true : undefined}
              className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none"
              style={{
                gridTemplateRows: visible ? '1fr' : '0fr',
                opacity: visible ? 1 : 0,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <WeekRow
                  week={
                    viewMode === 'week' && isSelectedWeek ? selectedWeek : week
                  }
                  eventsByDate={eventsByDate}
                  today={today}
                  selectedDate={viewMode === 'week' ? selectedDate : null}
                  onSelectDate={onSelectDate}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MainCalendar;
