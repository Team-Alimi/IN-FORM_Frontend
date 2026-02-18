import { CATEGORY_COLORS } from "../../../../constants/tagColors";

const DaySelectEvent = ({ event, isMini = false, onArticleClick }) => {
  let category;
  let categoryColor;
  const HandleEventClick = () => {
    onArticleClick(event.article_id, event.category_name);
    console.log("eventClicked : ", event.category_name);
  };
  switch (event.category_name) {
    case "LECTURE":
      category = "특강";
      categoryColor = CATEGORY_COLORS.LECTURE;
      break;
    case "CLUB":
      category = "동아리";
      categoryColor = CATEGORY_COLORS.CLUB;
      break;
    case "COMPETITION":
      category = "대회";
      categoryColor = CATEGORY_COLORS.COMPETITION;
      break;
    case "CONTEST":
      category = "공모전";
      categoryColor = CATEGORY_COLORS.CONTEST;
      break;
    default:
      category = "기타";
      categoryColor = CATEGORY_COLORS.DEFAULT;
  }
  if (isMini) {
    return (
      <button
        className="flex items-center gap-3 p-2 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xs"
        onClick={HandleEventClick}
      >
        {/* 카테고리 원형 배지 */}
        <div
          className={`w-2 h-2 rounded-full flex items-center  ${categoryColor}`}
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
        className="flex items-center gap-3 p-4 border-b border-gray-300 w-full hover:bg-gray-100 hover:rounded-xl transition duration-300 cursor-pointer"
        onClick={HandleEventClick}
      >
        {/* 카테고리 태그 */}
        <div
          className={`w-20 h-8 flex items-center justify-center rounded-md text-sm font-semibold ${categoryColor}`}
        >
          {category}
        </div>

        {/* 이벤트 제목 */}
        <div className="text-base font-medium">{event.title}</div>
      </button>
    );
  }
};

export default DaySelectEvent;
