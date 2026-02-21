import { CATEGORY_COLORS } from "../../../../constants/tagColors";
import { FILTER_OPTIONS } from "../../../../constants/filterOption";

const DaySelectEvent = ({ event, isMini = false, onArticleClick }) => {
  const HandleEventClick = () => {
    onArticleClick(event.article_id, event.category_name);
    console.log("eventClicked : ", event.category_name);
  };

  const option = FILTER_OPTIONS.find((o) => o.key === event.category_name);
  const category = option?.label ?? "기타";
  const categoryColor =
    CATEGORY_COLORS[event.category_name] ?? CATEGORY_COLORS.DEFAULT;
  if (isMini) {
    return (
      <button
        className="flex items-center gap-3 p-2 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xs"
        onClick={HandleEventClick}
      >
        {/* 카테고리 원형 배지 */}
        <div
          className={`w-2 h-2 rounded-full flex items-center ${categoryColor}`}
        ></div>

        {/* 이벤트 제목 */}
        <div className="text-[10px] font-normal text-gray-800">
          {event.title}
        </div>
      </button>
    );
  } else {
    return (
      <button
        className="flex items-center gap-3 p-4 max-mobile:p-2 max-mobile:gap-2 border-b border-gray-300 w-full hover:bg-gray-100 hover:rounded-xl transition duration-300 cursor-pointer"
        onClick={HandleEventClick}
      >
        {/* 카테고리 태그 */}
        <div
          className={`w-20 h-8 max-mobile:w-14 max-mobile:h-6 flex items-center justify-center rounded-md text-sm font-semibold max-mobile:text-[10px] ${categoryColor}`}
        >
          {category}
        </div>

        {/* 이벤트 제목 */}
        <div className="text-base font-medium max-mobile:text-[12px]">{event.title}</div>
      </button>
    );
  }
};

export default DaySelectEvent;
