import { FILTER_OPTIONS } from "@/constants/filterOption";

const CalendarFilterBar = ({
  selectedFilter,
  onClick,
  isMyDeptOnly = false,
  onMyDeptOnlyChange,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* 관심학과만 보기 체크박스 - 오른쪽 정렬 */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isMyDeptOnly}
            onChange={(e) => onMyDeptOnlyChange?.(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#4068f7] cursor-pointer"
          />
          <span className="text-[13px] text-gray-500 font-medium select-none">
            관심학과만 보기
          </span>
        </label>
      </div>

      {/* 카테고리 필터 칩 (MY/북마크 제외) - 스크롤 가능 */}
      <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide">
        {/* 전체 칩 */}
        <button
          onClick={() => onClick("ALL")}
          className={`text-sm font-medium py-1.5 px-4 rounded-full shrink-0 transition-colors ${
            selectedFilter.length === 0 ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          전체
        </button>
        {FILTER_OPTIONS.filter((item) => item.key !== "MY").map((item) => {
          const isSelected = selectedFilter.includes(item.key);
          const variant = isSelected
            ? `${item.color} text-white`
            : "bg-gray-100 text-gray-600";
          return (
            <button
              key={item.key}
              onClick={() => onClick(item.key)}
              className={`text-sm font-medium ${variant} py-1.5 px-4 rounded-full shrink-0 transition-colors`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default CalendarFilterBar;
