import Badge from "@/components/main/adaptive/common/Badge";
import { FILTER_OPTIONS, STATE_OPTIONS } from "@/constants/filterOption";

const STATUS_KEY_MAP = {
  "진행중": "OnGoing",
  "마감임박": "EndingSoon",
  "예정": "UpComing",
  "마감": "Ended",
};

const getCategoryBadge = (categoryKey) => {
  const found = FILTER_OPTIONS.find((opt) => opt.key === categoryKey);
  if (found) {
    return {
      label: found.label,
      color: `${found.tagBg} ${found.borderColor} ${found.textColor} border`,
    };
  }
  return { label: categoryKey, color: "bg-blue-100 border-blue-300 text-blue-700 border" };
};

const getStatusBadge = (status) => {
  const key = STATUS_KEY_MAP[status];
  const opt = STATE_OPTIONS.find((o) => o.key === key);
  if (!opt) return { text: status, color: "bg-gray-100 text-gray-500 border-gray-300 border" };
  return { text: status, color: `${opt.backgroundColor} ${opt.textColor} ${opt.borderColor} border` };
};

const MobileEventRow = ({ status, category, title, source, date, bookmarkCount, onClick }) => {
  const categoryBadge = category ? getCategoryBadge(category) : null;
  const statusBadge = getStatusBadge(status);

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
      {/* 출처, 날짜, 북마크 */}
      <div className="flex items-center justify-between text-gray-400 text-[14px]">
        <div className="flex items-center">
          <span>{source}</span>
          <span className="mx-1">•</span>
          <span>{date}</span>
        </div>
        <span className="text-[13px]">북마크 {bookmarkCount}</span>
      </div>
    </div>
  );
};

export default MobileEventRow;
