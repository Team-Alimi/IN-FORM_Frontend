import DaySelectEvent from "./DaySelectEvent";

const DaySelectEventList = ({ events, currentDate, ref, onArticleClick }) => {
  const year = currentDate.slice(0, 4);
  const month = currentDate.slice(5, 7);
  const day = currentDate.slice(8, 10);

  return (
    <div
      ref={ref}
      className="bg-white shadow-md rounded-3xl p-6 sm:p-8 md:p-10 w-full"
    >
      <div className="font-semibold text-center mb-4 md:mb-5 text-base sm:text-lg md:text-xl text-gray-800">
        {`${year}년 ${month}월 ${day}일의 행사`}
      </div>
      {!events || events.length === 0 ? (
        <p className="p-4 text-center text-gray-500 text-sm sm:text-base">
          선택된 날짜에 이벤트가 없습니다.
        </p>
      ) : (
        <div className="border-t border-gray-200">
          {events.map((event) => (
            <DaySelectEvent
              key={event.article_id}
              event={event}
              onArticleClick={onArticleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default DaySelectEventList;
