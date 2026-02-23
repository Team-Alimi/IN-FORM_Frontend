import HotEventRow from "./HotEventRow";
import { useQuery } from "@tanstack/react-query";
import { getHotEventList } from "../../../../api/getHotEventList";
import { useNavigate } from "react-router-dom";

const HotEventList = () => {
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
    <div className="bg-white p-2 rounded-xl ">
      <div className="text-sm font-bold">🔥 HOT 공지사항 </div>
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
