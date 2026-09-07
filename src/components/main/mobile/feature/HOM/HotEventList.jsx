import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import HotEventRow from "@/components/main/mobile/feature/HOM/HotEventRow";
import { fetchHotEvents } from "@/api/main/articles";
import { useDeviceStore } from "@/stores/deviceStore";
import backIcon from "@/assets/icons/back_simple.svg";
import NextIcon from "@/assets/icons/next_simple.svg";

const ITEM_WIDTH = 250;

const HotEventList = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["hotEvents"],
    queryFn: () => fetchHotEvents(),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
  });

  const handleArticleClick = (article_id, sourceType) => {
    if (sourceType === "CLUB") {
      navigate(`/clubs/detail/${article_id}`);
    } else {
      navigate(`/events/detail/${article_id}`);
    }
  };

  const handleScrollBack = () => {
    scrollRef.current.scrollBy({ left: -ITEM_WIDTH, behavior: "smooth" });
  };

  const handleScrollNext = () => {
    scrollRef.current.scrollBy({ left: ITEM_WIDTH, behavior: "smooth" });
  };

  // 로딩·에러·빈 데이터 시 섹션 자체를 숨김 (보조 섹션이므로 레이아웃 시프트 최소화)
  if (isLoading || error) return null;

  const articles = data?.data ?? [];
  if (articles.length === 0) return null;

  return (
    <div className={isMobile ? "py-2" : "bg-gray-50 rounded-2xl"}>
      {/* 섹션 타이틀 + 데스크톱 스크롤 버튼 */}
      <div className="flex flex-row items-center justify-between px-1 mb-2">
        <p className="text-[15px] font-bold text-gray-800">지금 뜨는 공지</p>
        <div className="flex flex-row max-mobile:hidden">
          <button className="p-2" onClick={handleScrollBack}>
            <img src={backIcon} className="h-4 w-4 cursor-pointer" alt="이전" />
          </button>
          <button className="p-2" onClick={handleScrollNext}>
            <img src={NextIcon} className="h-4 w-4 cursor-pointer" alt="다음" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-row overflow-x-auto scrollbar-hide px-2">
        {articles.map((item) => (
          <HotEventRow
            key={item.id}
            article_id={item.id}
            category={item.categories?.[0]?.name}
            sourceType={item.source_type}
            title={item.title}
            onArticleClick={handleArticleClick}
          />
        ))}
      </div>
    </div>
  );
};

export default HotEventList;
