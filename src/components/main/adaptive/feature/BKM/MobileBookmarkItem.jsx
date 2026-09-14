import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "@/components/main/adaptive/common/Badge";
import { IoChevronForwardOutline } from "react-icons/io5";
import { getStatus } from "@/utils/statusUtil";

const LONG_PRESS_DELAY = 500;

const MobileBookmarkItem = ({
  id,
  sourceType,
  title,
  categories,
  vendors,
  endsOn,
  deadlineStatus,
  viewCount,
  bookmarkCount,
  isSelected,
  onToggleSelect,
  isEditMode,
  onLongPress,
}) => {
  const navigate = useNavigate();
  const statusInfo = getStatus(deadlineStatus);
  const vendorName = vendors?.[0]?.name || "";
  const categoryName = categories?.[0]?.name || "";
  const displayDate = endsOn ? endsOn.replace(/-/g, ".") : "";

  // ─── 롱프레스 감지 ────────────────────────────────────────────────────────
  const pressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const handlePointerDown = () => {
    if (isEditMode) return;
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.(id);
    }, LONG_PRESS_DELAY);
  };

  const handlePointerUp = () => {
    clearTimeout(pressTimerRef.current);
  };

  const handlePointerCancel = () => {
    clearTimeout(pressTimerRef.current);
  };

  const handlePointerMove = () => {
    // 스크롤 중이면 롱프레스 취소
    clearTimeout(pressTimerRef.current);
  };

  const handleCardClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    if (isEditMode) {
      onToggleSelect(id);
      return;
    }
    if (sourceType === "CLUB") {
      navigate(`/clubs/detail/${id}`);
    } else {
      navigate(`/events/detail/${id}`);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect(id);
  };

  return (
    <div className="flex items-center gap-3 mb-2.5">
      {/* 원형 체크박스 - 편집 모드에서만 표시 */}
      {isEditMode && (
        <button
          onClick={handleCheckboxClick}
          aria-label={`${title} ${isSelected ? "선택 해제" : "선택"}`}
          aria-pressed={isSelected}
          className={`shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "border-[#4068f7] bg-[#4068f7]"
              : "border-gray-300 bg-white"
          }`}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}

      {/* 카드 */}
      <div
        onClick={handleCardClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
        className="flex-1 min-w-0 bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 cursor-pointer active:bg-gray-50 transition-colors select-none"
      >
        {/* 상단: 제목 + 카테고리/상태 배지 */}
        <div className="flex items-start gap-2 mb-2.5">
          <span className="flex-1 font-bold text-[15px] text-gray-900 leading-snug line-clamp-2">
            {title}
          </span>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {categoryName && <Badge category={categoryName} />}
            {statusInfo && (
              <Badge
                text={statusInfo.text}
                color={statusInfo.color}
                className="text-xs px-2 py-0.5 font-medium"
              />
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-100 mb-2" />

        {/* 하단 메타 정보 */}
        <div className="flex items-center text-gray-400 text-[12px] gap-1.5">
          {vendorName && <span>{vendorName}</span>}
          {vendorName && <span>•</span>}
          {displayDate && <span>{displayDate}</span>}
          {displayDate && viewCount != null && <span>•</span>}
          {viewCount != null && <span>조회 {viewCount.toLocaleString()}</span>}
          <span>•</span>
          <span>북마크 {bookmarkCount ?? 0}</span>
          <IoChevronForwardOutline size={13} className="ml-auto text-gray-300 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default MobileBookmarkItem;
