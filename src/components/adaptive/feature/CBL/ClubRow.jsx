const ClubRow = ({ data, onClick }) => {
  const { title, vendors, start_date, due_date, attachment_url, article_id } =
    data;
  return (
    <div
      className="flex flex-col bg-white w-full rounded-3xl overflow-hidden"
      onClick={() => onClick(article_id)}
    >
      <div className="w-full aspect-4/5 bg-gray-200 relative">
        {attachment_url ? (
          <img
            src={attachment_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // 이미지 없을 때
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col p-2">
        <div className="max-mobile:text-base text-lg max-mobile:font-medium font-bold text-gray-700">
          {title}
        </div>
        <div className="max-mobile:text-sm text-base font-medium text-gray-700">
          {vendors[0]?.vendor_name}
        </div>
        <div className="max-mobile:text-xs text-sm font-medium text-gray-700">{`${start_date || "미정"} ~ ${due_date || "미정"}`}</div>
      </div>
    </div>
  );
};
export default ClubRow;
