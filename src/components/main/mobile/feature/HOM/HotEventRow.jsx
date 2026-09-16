import Badge from "@/components/main/adaptive/common/Badge";

const HotEventRow = ({
  article_id = "",
  category = "기타",
  sourceType = "",
  title = "오류",
  onArticleClick,
}) => {
  if (!article_id || !title) return null;

  return (
    <div className="m-1 w-60 shrink-0">
      <div
        className="bg-white p-4 rounded-[18px] flex flex-col gap-1 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-28 overflow-hidden cursor-pointer active:bg-gray-50 transition-colors"
        onClick={() => onArticleClick(article_id, sourceType)}
      >
        <Badge category={category} className="self-start text-xs px-2 py-0.5 font-medium mb-1" />
        <div className="font-medium text-gray-700 line-clamp-2 text-sm">{title}</div>
      </div>
    </div>
  );
};
export default HotEventRow;
