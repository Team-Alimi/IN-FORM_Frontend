import HotEventRow from "./HotEventRow";
import { useQuery } from "@tanstack/react-query";
import { getHotEventList } from "../../../../api/getHotEventList";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "../../../../stores/deviceStore";

const HotEventList = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const { data, isLoading, error } = useQuery({
    queryKey: ["getHotEventList"],
    queryFn: () => getHotEventList(),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
  });
  const navigate = useNavigate();
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
          : "bg-gray-50  rounded-2xl "
      }
    >
      <div className="text-lg font-bold max-mobile:text-base">
        🔥 HOT 공지사항{" "}
      </div>
      {/** <button onClick={() => console.log(articles)}>로그 보기</button>*/}
      <div className="flex flex-row overflow-x-auto max-mobile:scrollbar-hide">
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
