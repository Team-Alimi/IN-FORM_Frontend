import { useDeviceStore } from "@/stores/deviceStore";

const ClubRow = ({ data, onClick }) => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const { title, vendors, starts_on, ends_on, id, view_count } = data;
  const clubName = vendors?.[0]?.name ?? "";

  const handleClick = () => onClick(id);

  if (isMobile) {
    return (
      <div
        className="flex items-center gap-3 bg-white rounded-[18px] px-3 py-3 mb-2.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:bg-gray-50 transition-colors"
        onClick={handleClick}
      >
        {/* 좌측 썸네일 (목록 API는 attachment_url 미제공 → 글자 아바타) */}
        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <span className="text-blue-400 font-bold text-2xl">{clubName.charAt(0)}</span>
        </div>

        {/* 우측 텍스트 */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-[14px] line-clamp-2 leading-snug">{title}</p>
          {/* 메타 정보 */}
          <div className="flex items-center gap-1 text-gray-400 text-[11px] mt-1">
            {clubName && <span className="truncate max-w-24">{clubName}</span>}
            {view_count != null && (
              <>
                {clubName && <span>·</span>}
                <span>조회 {view_count.toLocaleString()}</span>
              </>
            )}
            {ends_on && (
              <>
                <span>·</span>
                <span>~{ends_on}</span>
              </>
            )}
          </div>
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
      <div className="w-full aspect-4/5 bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
        <span className="text-blue-300 font-bold text-5xl">{clubName.charAt(0)}</span>
      </div>
      <div className="flex flex-col p-4 gap-1">
        <div className="text-lg font-bold text-gray-700">{title}</div>
        <div className="text-base font-medium text-gray-700">{clubName}</div>
        <div className="text-sm text-gray-500">{`${starts_on || "미정"} ~ ${ends_on || "미정"}`}</div>
      </div>
    </div>
  );
};

export default ClubRow;
