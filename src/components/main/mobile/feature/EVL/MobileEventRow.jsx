import Badge from "@/components/main/adaptive/common/Badge";
import { IoChevronForwardOutline } from "react-icons/io5";

// "2026-08-20" → "2026.08.20"
const formatDate = (dateStr) => dateStr?.replace(/-/g, ".") ?? "";

const MobileEventRow = ({ status, category, title, vendors = [], date, bookmarkCount, viewCount, onClick }) => {
  const vendorName = vendors[0]?.name ?? "";

  return (
    <div
      className="w-full bg-white rounded-[18px] px-4 py-3.5 mb-2.5 cursor-pointer border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {/* 제목(좌, flex-1) + 뱃지(우상단) */}
      <div className="flex items-start gap-2 mb-2.5">
        <p className="flex-1 font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">
          {title}
        </p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {category && <Badge category={category} />}
          {status && (
            <Badge
              text={status.text}
              color={status.color}
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
        <span>{formatDate(date)}</span>
        {viewCount != null && (
          <>
            <span>•</span>
            <span>조회 {viewCount.toLocaleString()}</span>
          </>
        )}
        <span>•</span>
        <span>북마크 {bookmarkCount}</span>
        <IoChevronForwardOutline size={13} className="ml-auto text-gray-300 shrink-0" />
      </div>
    </div>
  );
};

export default MobileEventRow;
