import { useState, useEffect } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import DaySelectEvent from "@/components/main/adaptive/feature/HOM/DaySelectEvent";
import { useDeviceStore } from "@/stores/deviceStore";
import { useSwipeable } from "react-swipeable";

const PAGE_SIZE = 8;

const DaySelectEventList = ({ events, currentDate, onArticleClick }) => {
  const [page, setPage] = useState(0);
  const isMobile = useDeviceStore((state) => state.isMobile);

  // 날짜 또는 이벤트 목록이 바뀌면 첫 페이지로 초기화
  useEffect(() => {
    setPage(0);
  }, [currentDate, events]);

  const year = currentDate.slice(0, 4);
  const month = currentDate.slice(5, 7);
  const day = currentDate.slice(8, 10);

  const totalPages = events ? Math.ceil(events.length / PAGE_SIZE) : 0;

  // 슬라이드 애니메이션을 위해 모든 페이지 데이터를 미리 분할
  const pagedEvents = events
    ? Array.from({ length: totalPages }, (_, i) =>
        events.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
      )
    : [];

  const moveNextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };
  const movePrevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => moveNextPage(),
    onSwipedRight: () => movePrevPage(),
    delta: 50,
    preventScrollOnSwipe: true,
    enabled: isMobile,
  });

  return (
    <div
      id="event-list-section"
      {...swipeHandlers}
      className={
        isMobile
          ? "w-full min-w-0 bg-gray-50 rounded-[18px] px-4 py-3 mb-3 cursor-pointer shadow-[0_2px_12px_rgba(0,72,152,0.04)"
          : "bg-white rounded-2xl p-6 max-mobile:p-4 sm:p-8 md:p-10 w-full min-w-0"
      }
    >
      <div className="flex flex-col items-center gap-1 mb-4 md:mb-5">
        {/* dot 인디케이터: 페이지 2개 이상일 때만 */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === page
                    ? "w-4 h-1.5 bg-blue-500"
                    : "w-1.5 h-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
        {/* 화살표 + 날짜: 날짜는 항상 표시, 화살표는 페이지 2개 이상일 때만 */}
        <div className="flex items-center gap-4 max-mobile:gap-3">
          {totalPages > 1 ? (
            <button
              onClick={() => movePrevPage()}
              disabled={page === 0}
              className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronBackOutline className="text-gray-500 text-lg" />
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className="font-semibold text-center text-base sm:text-lg md:text-xl text-gray-800">
            {`${year}년 ${month}월 ${day}일`}
          </div>
          {totalPages > 1 ? (
            <button
              onClick={() => moveNextPage()}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronForwardOutline className="text-gray-500 text-lg" />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>
      </div>

      {/* 콘텐츠: 슬라이드 애니메이션 */}
      {!events || events.length === 0 ? (
        <p className="p-4 text-center text-gray-500 text-sm sm:text-base">
          선택된 날짜에 이벤트가 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden w-full">
          <div
            className="flex w-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pagedEvents.map((pageEvents, i) => (
              <div key={i} className="shrink-0 basis-full min-w-0 border-t border-gray-200">
                {pageEvents.map((event) => (
                  <DaySelectEvent
                    key={event.article_id}
                    event={event}
                    onArticleClick={onArticleClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DaySelectEventList;
