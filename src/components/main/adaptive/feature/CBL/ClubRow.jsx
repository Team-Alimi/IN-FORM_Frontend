import { useDeviceStore } from "@/stores/deviceStore";
import Badge from "@/components/main/adaptive/common/Badge";

const ClubRow = ({ data, onClick }) => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const { title, vendors, start_date, due_date, attachment_url, article_id, categories } = data;
  const clubName = vendors?.[0]?.vendor_name ?? "";
  const category = categories?.category_name;

  const handleClick = () => onClick(article_id);

  if (isMobile) {
    return (
      <div
        className="flex items-center gap-3 bg-white rounded-[18px] px-3 py-3 mb-2.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:bg-gray-50 transition-colors"
        onClick={handleClick}
      >
        {/* 좌측 썸네일 */}
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
          {attachment_url ? (
            <img src={attachment_url} alt={clubName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-2xl">{clubName.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* 우측 텍스트 */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-[14px] truncate">{clubName}</p>
          <p className="text-gray-400 text-[12px] truncate mt-0.5">{title}</p>
          {category && <div className="mt-1.5"><Badge category={category} /></div>}
        </div>
      </div>
    );
  }

  // 데스크톱: 기존 세로 카드 유지
  return (
    <div
      className="flex flex-col bg-white w-full rounded-3xl overflow-hidden shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-full aspect-4/5 bg-gray-200 relative">
        {attachment_url ? (
          <img
            src={attachment_url}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <span className="text-blue-300 font-bold text-5xl">{clubName.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col p-4 gap-1">
        <div className="text-lg font-bold text-gray-700">{title}</div>
        <div className="text-base font-medium text-gray-700">{clubName}</div>
        <div className="text-sm text-gray-500">{`${start_date || "미정"} ~ ${due_date || "미정"}`}</div>
      </div>
    </div>
  );
};

export default ClubRow;
