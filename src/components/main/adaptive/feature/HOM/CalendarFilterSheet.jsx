import { useState, useEffect } from "react";
import BottomSheet from "@/components/main/mobile/common/BottomSheet";
import {
  CATEGORY_NAME_COLOR_MAP,
  DEFAULT_CATEGORY_COLOR,
  STATE_OPTIONS,
} from "@/constants/filterOption";

// API deadline_status 값 → STATE_OPTIONS key 매핑
const DEADLINE_API_TO_STATE_KEY = {
  OPEN:         "OnGoing",
  CLOSING_SOON: "EndingSoon",
  UPCOMING:     "UpComing",
  CLOSED:       "Ended",
};

const DEADLINE_STATUS_OPTIONS = [
  { key: "OPEN",         label: "진행중" },
  { key: "CLOSING_SOON", label: "마감임박" },
  { key: "UPCOMING",     label: "예정" },
  { key: "CLOSED",       label: "마감" },
];

// deadline_status 칩 스타일: 선택 시 STATE_OPTIONS 색상 적용
const getDeadlineChipClass = (key, isSelected) => {
  const stateOpt = STATE_OPTIONS.find((o) => o.key === DEADLINE_API_TO_STATE_KEY[key]);
  if (!stateOpt) {
    return isSelected
      ? "bg-gray-200 text-gray-700 border-gray-300"
      : "bg-white text-gray-500 border-gray-200";
  }
  return isSelected
    ? `${stateOpt.backgroundColor} ${stateOpt.textColor} ${stateOpt.borderColor}`
    : "bg-white text-gray-500 border-gray-200";
};

/**
 * 홈 캘린더 필터 바텀시트
 * @param {boolean}  isOpen                - 열림 여부
 * @param {function} onClose               - 닫기 핸들러
 * @param {Array}    categories            - API 카테고리 목록 [{ id, name }]
 * @param {number[]} selectedCategoryIds   - 현재 선택된 카테고리 ID 배열
 * @param {string[]} selectedDeadlineStatuses - 선택된 마감 상태 배열
 * @param {function} onApply              - ({ categoryIds, deadlineStatuses }) => void
 */
const CalendarFilterSheet = ({
  isOpen,
  onClose,
  categories = [],
  selectedCategoryIds,
  selectedDeadlineStatuses,
  onApply,
}) => {
  const [localCategoryIds, setLocalCategoryIds] = useState(selectedCategoryIds);
  const [localDeadlineStatuses, setLocalDeadlineStatuses] = useState(selectedDeadlineStatuses);

  // 바텀시트 열릴 때 현재 적용된 필터 값으로 동기화
  useEffect(() => {
    if (!isOpen) return;
    setLocalCategoryIds(selectedCategoryIds);
    setLocalDeadlineStatuses(selectedDeadlineStatuses);
  }, [isOpen]);

  const toggleCategory = (id) => {
    setLocalCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleDeadlineStatus = (key) => {
    setLocalDeadlineStatuses((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleReset = () => {
    setLocalCategoryIds([]);
    setLocalDeadlineStatuses([]);
  };

  const handleApply = () => {
    onApply({
      categoryIds: localCategoryIds,
      deadlineStatuses: localDeadlineStatuses,
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[15px] font-bold text-gray-900">행사 필터</p>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-gray-400 underline underline-offset-2"
        >
          초기화
        </button>
      </div>

      {/* 마감 상태 */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-800 mb-2">
          마감 상태 <span className="text-gray-500 font-normal">Status</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {DEADLINE_STATUS_OPTIONS.map((opt) => {
            const isSelected = localDeadlineStatuses.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleDeadlineStatus(opt.key)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${getDeadlineChipClass(opt.key, isSelected)}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-800 mb-2">
          카테고리 <span className="text-gray-500 font-normal">Category</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = localCategoryIds.includes(cat.id);
            const colorInfo = CATEGORY_NAME_COLOR_MAP[cat.name] ?? DEFAULT_CATEGORY_COLOR;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  isSelected
                    ? `${colorInfo.dot} text-white border-transparent`
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 적용 버튼 */}
      <button
        type="button"
        onClick={handleApply}
        className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold"
      >
        적용하기
      </button>
    </BottomSheet>
  );
};

export default CalendarFilterSheet;
