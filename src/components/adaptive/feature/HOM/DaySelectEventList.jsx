import { useState, useEffect } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import DaySelectEvent from "./DaySelectEvent";

const PAGE_SIZE = 8;

const DaySelectEventList = ({ events, currentDate, ref, onArticleClick }) => {
  const [page, setPage] = useState(0);

  // 날짜가 바뀌면 첫 페이지로 초기화
  useEffect(() => {
    setPage(0);
  }, [currentDate]);

  const year = currentDate.slice(0, 4);
  const month = currentDate.slice(5, 7);
  const day = currentDate.slice(8, 10);

  const totalPages = events ? Math.ceil(events.length / PAGE_SIZE) : 0;
  const currentPageEvents = events
    ? events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    : [];

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 max-mobile:p-4 sm:p-8 md:p-10 w-full"
    >
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="w-6" />
        <div className="font-semibold text-center text-base sm:text-lg md:text-xl text-gray-800">
          {`${year}년 ${month}월 ${day}일`}
        </div>
        {totalPages > 1 ? (
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <IoChevronBackOutline className="text-gray-500 text-lg" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <IoChevronForwardOutline className="text-gray-500 text-lg" />
              </button>
            </div>
            <div className="text-xs text-gray-400">
              {page + 1}/{totalPages}
            </div>
          </div>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {!events || events.length === 0 ? (
        <p className="p-4 text-center text-gray-500 text-sm sm:text-base">
          선택된 날짜에 이벤트가 없습니다.
        </p>
      ) : (
        <>
          <div className="border-t border-gray-200">
            {currentPageEvents.map((event) => (
              <DaySelectEvent
                key={event.article_id}
                event={event}
                onArticleClick={onArticleClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default DaySelectEventList;
