import { CATEGORY_NAME_COLOR_MAP, CATEGORY_CODE_TO_NAME_MAP, DEFAULT_CATEGORY_COLOR } from "@/constants/filterOption";
// 이벤트 카테고리에 따른 dot 색상 반환 (영어 코드·한글명 모두 처리)
const getEventColor = (event) => {
  const rawName = event?.category_name;
  const categoryName = CATEGORY_CODE_TO_NAME_MAP[rawName] ?? rawName;
  const colorInfo = CATEGORY_NAME_COLOR_MAP[categoryName] ?? DEFAULT_CATEGORY_COLOR;
  return colorInfo.dot;
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
