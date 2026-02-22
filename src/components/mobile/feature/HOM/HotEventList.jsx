import HotEventRow from "./HotEventRow";
import { useQuery } from "@tanstack/react-query";
import { getHotEventList } from "../../../../api/getHotEventList";

const HotEventList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getHotEventList"],
    queryFn: () => getHotEventList(),
    staleTime: 60 * 1000 * 10,
    gcTime: 60 * 1000 * 20,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  const articles = data?.data ?? [];

  return (
    <div>
      <div>🔥 HOT 공지사항 </div>
      <button onClick={() => console.log(articles)}>로그 보기</button>
      {articles.map((item) => (
        <HotEventRow
          key={item.article_id}
          category={item.categories?.category_name}
          title={item.title}
          vendor={item.vendors?.[0]?.vendor_name}
          start_date={item.start_date}
          due_date={item.due_date}
          bookmarks={item.bookmark_count}
        />
      ))}
    </div>
  );
};
export default HotEventList;
