import DaySelectEvent from "@/components/main/adaptive/feature/HOM/DaySelectEvent";

const MiniCalendarEventList = ({
  events,
  currentDate,
  isMini,
  onArticleClick,
}) => {
  const year = currentDate.slice(0, 4);
  const month = currentDate.slice(5, 7);
  const day = currentDate.slice(8, 10);
  let calEventListStyle = "";
  if (isMini) {
    calEventListStyle = "font-medium m-1 text-xs pt-2 pb-0 ";
  } else {
    calEventListStyle = "font-semibold mb-4 text-base sm:text-lg md:text-xl";
  }
  return (
    <div className="w-full cursor-pointer  px-1">
      <div className={`text-center text-gray-800 ${calEventListStyle} `}>
        {/* {`${year}년 ${month}월 ${day}일`} */}
      </div>
      <div className="relative">
        <div className="bg-white  p-2 w-full overflow-y-auto h-60 scrollbar-hide">
          {!events || events.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm ">
              선택된 날짜에 이벤트가 없습니다.
            </p>
          ) : (
            <div className="mt-1">
              {events.map((event) => (
                <DaySelectEvent
                  key={event.article_id}
                  event={event}
                  isMini={isMini}
                  onArticleClick={onArticleClick}
                />
              ))}
            </div>
          )}
        </div>
        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none "></div>
      </div>
    </div>
  );
};

export default MiniCalendarEventList;
