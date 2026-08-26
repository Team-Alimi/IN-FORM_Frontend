import { useNavigate } from "react-router-dom";
import Badge from "@/components/main/adaptive/common/Badge";

// 썸네일 없을 때 이니셜 카드
const ClubThumbnail = ({ name, attachment_url }) => {
  if (attachment_url) {
    return (
      <img
        src={attachment_url}
        alt={name}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
      <span className="text-blue-400 font-bold text-3xl">{name.charAt(0)}</span>
    </div>
  );
};

const RecommendedClubCarousel = ({ clubs }) => {
  const navigate = useNavigate();

  if (!clubs || clubs.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="text-[15px] font-bold text-gray-800 mb-3">추천 동아리</p>
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {clubs.map((club) => {
          const clubName = club.vendors?.[0]?.vendor_name ?? "";
          const category = club.categories?.category_name;
          return (
            <div
              key={club.article_id}
              className="shrink-0 w-36 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
              style={{ scrollSnapAlign: "start" }}
              onClick={() => navigate(`/clubs/detail/${club.article_id}`)}
            >
              {/* 썸네일 */}
              <div className="w-full h-24 overflow-hidden">
                <ClubThumbnail name={clubName} attachment_url={club.attachment_url} />
              </div>
              {/* 텍스트 */}
              <div className="p-2.5">
                <p className="font-bold text-gray-900 text-[13px] truncate">{clubName}</p>
                {category && <div className="mt-1.5"><Badge category={category} /></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedClubCarousel;
