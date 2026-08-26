import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const RecommendedClubCarousel = ({ clubs }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!clubs || clubs.length === 0) return null;

  // 스크롤 위치 기준으로 가운데에 가장 가까운 카드 인덱스 계산
  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let minDist = Infinity;
    let closest = 0;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  };

  return (
    <div className="mb-6">
      {/* 캐러셀 스크롤 영역 */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          // 숨겨진 스크롤바
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        onScroll={handleScroll}
      >
        {/* 앞 스페이서: 첫 카드가 가운데 정렬되도록 */}
        <div className="shrink-0 w-[21%]" aria-hidden="true" />

        {clubs.map((club, i) => {
          const clubName = club.vendors?.[0]?.vendor_name ?? "";
          // tags: 동아리 태그 (백엔드 API 연동 예정, 현재 mock 데이터 사용)
          const tags = club.tags ?? [];
          const isActive = i === activeIndex;

          return (
            <div
              key={club.article_id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`shrink-0 w-[58%] relative rounded-3xl overflow-hidden cursor-pointer transition-transform duration-300 ${
                isActive ? "scale-100" : "scale-[0.88]"
              }`}
              style={{
                scrollSnapAlign: "center",
                aspectRatio: "3 / 4",
              }}
              onClick={() => navigate(`/clubs/detail/${club.article_id}`)}
            >
              {/* 배경 이미지 또는 그라디언트 */}
              <div className="absolute inset-0">
                {club.attachment_url ? (
                  <img
                    src={club.attachment_url}
                    alt={clubName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-7xl opacity-20 select-none">
                      {clubName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* 하단 dark gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

              {/* 태그 뱃지 (우상단, 최대 2개) */}
              {tags.length > 0 && (
                <div className="absolute top-3 right-3 flex gap-1">
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 하단 텍스트 overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
                <p className="text-white font-bold text-[17px] leading-tight truncate">
                  {clubName}
                </p>
                <p className="text-white/65 text-[12px] mt-1 line-clamp-1">
                  {club.title}
                </p>
              </div>
            </div>
          );
        })}

        {/* 뒤 스페이서: 마지막 카드가 가운데 정렬되도록 */}
        <div className="shrink-0 w-[21%]" aria-hidden="true" />
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {clubs.map((_, i) => (
          <div
            key={i}
            className={`rounded-full bg-blue-500 transition-all duration-300 ${
              i === activeIndex ? "w-5 h-2" : "w-2 h-2 opacity-25"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedClubCarousel;
