import { useNavigate } from "react-router-dom";
import Badge from "@/components/main/adaptive/common/Badge";
import { getStatus } from "@/utils/statusUtil";

const MobileBookmarkItem = ({
  id,
  sourceType,
  title,
  categories,
  vendors,
  endsOn,
  deadlineStatus,
  viewCount,
  isSelected,
  onToggleSelect,
}) => {
  const navigate = useNavigate();
  const statusInfo = getStatus(deadlineStatus);
  const vendorName = vendors?.[0]?.name || "";
  const categoryName = categories?.[0]?.name || "";

  // 마감일 단일 표시 (없으면 생략)
  const displayDate = endsOn ? endsOn.replace(/-/g, ".") : "";

  const handleItemClick = () => {
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
    <div className="flex items-center gap-3 mb-3">
      {/* 원형 체크박스 (카드 바깥) */}
      <button
        onClick={handleCheckboxClick}
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

      {/* 카드 */}
      <div
        onClick={handleItemClick}
        className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-3.5 cursor-pointer active:scale-[0.99] transition-all"
      >
        {/* 상단: 제목 + 카테고리/상태 배지 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-bold text-[15px] text-gray-900 leading-snug break-keep line-clamp-2 flex-1">
            {title}
          </span>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {categoryName && (
              <Badge category={categoryName} className="text-[10px] px-2 py-0.5" />
            )}
            {statusInfo && (
              <Badge
                text={statusInfo.text}
                color={`${statusInfo.color} border`}
                className="text-[10px] px-2 py-0.5"
              />
            )}
          </div>
        </div>

        {/* 하단: 출처 · 날짜 · 조회수 + 화살표 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 flex-wrap">
            {vendorName && <span>{vendorName}</span>}
            {vendorName && (displayDate || viewCount != null) && (
              <span className="text-gray-200">•</span>
            )}
            {displayDate && <span>{displayDate}</span>}
            {displayDate && viewCount != null && (
              <span className="text-gray-200">•</span>
            )}
            {viewCount != null && (
              <span>조회 {viewCount.toLocaleString()}</span>
            )}
          </div>
          <svg
            className="w-4 h-4 text-gray-300 shrink-0 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MobileBookmarkItem;
