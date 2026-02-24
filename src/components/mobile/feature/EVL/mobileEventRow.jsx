import React from "react";
import Badge from "../../../adaptive/common/Badge";
import { FILTER_OPTIONS } from "../../../../constants/filterOption";

const getCategoryBadge = (categoryKey) => {
  const found = FILTER_OPTIONS.find(opt => opt.key === categoryKey);
  if (found) {
    return {
      label: found.label,
      color: `${found.tagBg} ${found.borderColor} ${found.textColor} border`,
    };
  }
  return { label: categoryKey, color: "bg-blue-100 border-blue-300 text-blue-700 border" };
};

const MobileEventRow = ({ status, category, title, source, date, bookmarkCount, onClick }) => {
  // 카테고리 뱃지 색상
  const categoryBadge = category ? getCategoryBadge(category) : null;
  // 상태 뱃지 색상
  let statusBadge = { text: status, color: "bg-gray-100 text-gray-500" };
  if (status === "진행중")       statusBadge = { text: status, color: "text-Ongoing border-Ongoing bg-green-50" };
  else if (status === "마감임박") statusBadge = { text: status, color: "text-EndingSoon border-EndingSoon bg-orange-50" };
  else if (status === "예정")    statusBadge = { text: status, color: "text-Upcoming border-Upcoming bg-blue-50" };
  else if (status === "마감")    statusBadge = { text: status, color: "text-Ended border-Ended bg-gray-50" };

  return (
    <div
      className="w-full bg-[#F7FAFC] rounded-[18px] px-4 py-3 mb-3 cursor-pointer shadow-[0_2px_12px_rgba(0,72,152,0.04)]"
      onClick={onClick}
    >
      {/* 뱃지 영역 */}
      <div className="flex gap-2 mb-2">
        {categoryBadge && (
          <Badge
            text={categoryBadge.label}
            color={categoryBadge.color}
            className="text-xs px-2 py-0.5 font-medium"
          />
        )}
        <Badge
          text={statusBadge.text}
          color={statusBadge.color}
          className="text-xs px-2 py-0.5 font-medium"
        />
      </div>
      {/* 제목 */}
      <div className="font-bold text-gray-900 text-[16px] mb-1 leading-snug">
        {title}
      </div>
      {/* 출처, 날짜 */}
      <div className="flex items-center text-gray-400 text-[14px] mb-1">
        <span>{source}</span>
        <span className="mx-1">•</span>
        <span>{date}</span>
      </div>
      {/* 북마크 수 */}
      <div className="text-gray-400 text-[13px]">북마크 {bookmarkCount}</div>
    </div>
  );
};

export default MobileEventRow;
