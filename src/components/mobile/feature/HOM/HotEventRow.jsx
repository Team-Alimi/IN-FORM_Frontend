import { FILTER_OPTIONS } from "../../../../constants/filterOption";

const HotEventRow = ({
  article_id = "",
  category = "기타",
  title = "오류",
  vendor = "미확인",
  start_date = "",
  due_date = "",
  bookmarks = 0,
  onArticleClick,
}) => {
  const option = FILTER_OPTIONS.find((o) => o.key === category);
  const label = option?.label ?? "기타";
  const tagBg = option?.tagBg ?? "bg-gray-200";
  const HandleEventClick = (article_id, category_name) => {
    onArticleClick(article_id, category_name);
  };
  return (
    <div className="m-2 w-60 shrink-0">
      <div
        className="bg-white p-3 rounded-2xl  flex flex-col gap-1"
        onClick={() => HandleEventClick(article_id, category)}
      >
        <div
          className={`self-start px-2 py-0.5 rounded text-xs font-medium text-black ${tagBg}`}
        >
          {label}
        </div>
        <div className="text-xs font-medium text-gray-700">{title}</div>
        <div className="text-xs">{vendor}</div>
        <div className="text-xs">
          <p>{`${start_date} ~ ${due_date}`}</p>
        </div>
        <div className="text-xs">{`북마크 ${bookmarks}`}</div>
      </div>
    </div>
  );
};
export default HotEventRow;
