import { CATEGORY_COLORS } from "@/constants/tagColors";
import { FILTER_OPTIONS } from "@/constants/filterOption";
// 이벤트 카테고리에 따른 색상 반환
const getEventColor = (event) => {
  const categoryName = event?.category_name;
  const selectevent = FILTER_OPTIONS.find(
    (item) => item.key === categoryName?.toUpperCase(),
  );
  return selectevent?.color || "bg-gray-200";
};
/**
 * EventBar - 이벤트를 나타내는 가로 바
 * @param {Object} event - 이벤트 데이터
 * @param {number} startCol - 시작 컬럼 (0-6, 일요일=0)
 * @param {number} span - 차지하는 컬럼 수
 * @param {number} row - 세로 위치 (같은 날 여러 이벤트가 있을 때 층)(0~n)
 */
const EventBar = ({ event, startCol, span, row }) => {
  const bgColor = getEventColor(event);

  return (
    <div
      className={`${bgColor} text-white text-xs px-2 rounded flex items-center max-mobile:text-[8px] max-mobile:py-0`}
      style={{
        gridColumn: `${startCol + 1} / span ${span}`,
        gridRow: row + 1,
      }}
    >
      <span className="truncate">{event.title}</span>
    </div>
  );
};

export default EventBar;
