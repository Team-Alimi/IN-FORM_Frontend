import HotEventRow from "./HotEventRow";
import { useQuery } from "@tanstack/react-query";
import { getHotEventList } from "../../../../api/getHotEventList";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "../../../../stores/deviceStore";
import backIcon from "../../../../assets/icons/back_simple.svg";
import NextIcon from "../../../../assets/icons/next_simple.svg";
import {useRef} from "react";
const ITEMWIDTH = 250;
const HotEventList = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const { data, isLoading, error } = useQuery({
    queryKey: ["getHotEventList"],
    queryFn: () => getHotEventList(),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
  });
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  const articles = data?.data ?? [];
  const handleArticleClick = (article_id, category) => {
    if (category === "CLUB") {
      navigate(`/clubs/detail/${article_id}`);
    } else {
      navigate(`/events/detail/${article_id}`);
    }
  };

 const handleScrollBack = () => {
  scrollRef.current.scrollBy({
    left : -ITEMWIDTH,
    behavior : "smooth",
  })
 }
 
 const handleScrollNext = () => {
  scrollRef.current.scrollBy({
    left : ITEMWIDTH,
    behavior : "smooth",
  })
 }

  {
    /**
       <HotEventRow
            article_id={item.article_id}
            key={item.article_id}
            category={item.categories?.category_name}
            title={item.title}
            vendor={item.vendors?.[0]?.vendor_name}
            start_date={item.start_date}
            due_date={item.due_date}
            bookmarks={item.bookmark_count}
            onArticleClick={handleArticleClick}
          />
    */
  }
  return (
    <div
      className={
        isMobile
          ? "bg-[#F4F8FE] rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-3"
          : "bg-gray-50 rounded-2xl "
      }
    >
      <div className = "flex flex-row justify-between">
    <div className="text-lg font-bold max-mobile:text-base">
        🔥 HOT 공지사항{" "}
      </div>
      <div className = "flex flex-row gap-4 max-mobile:hidden">
        <button className="p-2" onClick={handleScrollBack}>
          <img src={backIcon} className="h-4 w-4 cursor-pointer" />
        </button>
        <button className="p-2" onClick={handleScrollNext}>
          <img src={NextIcon} className="h-4 w-4 cursor-pointer" />
        </button>
        </div>
      </div>
  
      <div ref = {scrollRef} className="flex flex-row overflow-x-auto scrollbar-hide px-2">
        {articles.map((item) => (
          <HotEventRow
            article_id={item.article_id}
            key={item.article_id}
            category={item.categories?.category_name}
            title={item.title}
            onArticleClick={handleArticleClick}
          />
        ))}
      </div>
    </div>
  );
};
export default HotEventList;
