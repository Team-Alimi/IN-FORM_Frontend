import { CATEGORY_NAME_COLOR_MAP, DEFAULT_CATEGORY_COLOR } from "@/constants/filterOption";

/**
 * 홈 캘린더 필터 바 (카테고리 칩 + 관심학과 체크박스)
 * @param {Array}    categories          - API에서 받은 카테고리 목록 [{ id, name }]
 * @param {number[]} selectedCategoryIds - 선택된 카테고리 ID 배열
 * @param {function} onCategoryClick     - 카테고리 클릭 핸들러 (id: number | null) => void
 * @param {boolean}  isMyDeptOnly        - 관심학과만 보기 여부
 * @param {function} onMyDeptOnlyChange  - 관심학과 체크박스 변경 핸들러
 */
const CalendarFilterBar = ({
  categories = [],
  selectedCategoryIds = [],
  onCategoryClick,
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
            className="w-3.5 h-3.5 accent-primary cursor-pointer"
          />
          <span className="text-[13px] text-gray-500 font-medium select-none">
            관심학과만 보기
          </span>
        </label>
      </div>

      {/* 카테고리 필터 칩 - 스크롤 가능 */}
      <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide">
        {/* 전체 칩: 선택된 카테고리가 없을 때 활성 */}
        <button
          type="button"
          onClick={() => onCategoryClick(null)}
          className={`text-sm font-medium py-1.5 px-4 rounded-full shrink-0 transition-colors ${
            selectedCategoryIds.length === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          전체
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryIds.includes(cat.id);
          const colorInfo = CATEGORY_NAME_COLOR_MAP[cat.name] ?? DEFAULT_CATEGORY_COLOR;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryClick(cat.id)}
              className={`text-sm font-medium py-1.5 px-4 rounded-full shrink-0 transition-colors ${
                isSelected
                  ? `${colorInfo.dot} text-white`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarFilterBar;
