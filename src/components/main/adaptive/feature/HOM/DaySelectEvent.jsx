import { FILTER_OPTIONS } from "@/constants/filterOption";

const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DaySelectEvent = ({ event, isMini = false, onArticleClick, currentDate }) => {
  const handleEventClick = () => {
    onArticleClick(event.id, event.category_name);
  };

  const option = FILTER_OPTIONS.find(
    (o) => o.key === event.category_name?.toUpperCase(),
  );
  const category = option?.label ?? "기타";

  if (isMini) {
    return (
      <button
        className="flex items-center gap-3 p-2 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xs"
        onClick={handleEventClick}
      >
        {/* 카테고리 원형 배지 */}
        <div
          className={`w-2 h-2 rounded-full flex items-center ${option?.color ?? "bg-gray-400"}`}
        ></div>

        {/* 이벤트 제목 */}
        <div className="text-[10px] font-normal text-gray-800">
          {event.title}
        </div>
      </button>
    );
  }

  // currentDate("2025-11-17")에서 날짜·요일 추출 (로컬 시간 기준)
  const [y, m, d] = (currentDate ?? "").split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayNum = String(d).padStart(2, "0");
  const dayAbbr = DAY_ABBR[dateObj.getDay()];

  return (
    <button
      className="flex items-center gap-3 py-3 px-1 w-full hover:bg-gray-100 hover:rounded-xl transition duration-200 cursor-pointer border-b border-gray-100 last:border-b-0"
      onClick={handleEventClick}
    >
      {/* 왼쪽: 날짜 숫자 + 영문 요일 */}
      <div className="flex flex-col items-center justify-center w-10 shrink-0">
        <span className="text-[18px] font-bold text-gray-800 leading-tight">{dayNum}</span>
        <span className="text-[10px] text-gray-400 font-medium">{dayAbbr}</span>
      </div>

      {/* 세로 구분선 */}
      <div className="w-px self-stretch bg-gray-200 shrink-0" />

      {/* 오른쪽: 카테고리 배지 + 행사 제목 */}
      <div className="flex flex-col gap-1 flex-1 min-w-0 text-left">
        <span
          className={`inline-flex items-center self-start px-2 py-0.5 rounded-md text-[11px] font-semibold ${option?.tagBg ?? "bg-gray-100"} ${option?.textColor ?? "text-gray-500"}`}
        >
          {category}
        </span>
        <span className="text-[13px] font-medium text-gray-800 wrap-break-word">
          {event.title}
        </span>
      </div>
    </button>
  );
};

export default DaySelectEvent;
