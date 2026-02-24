import { useState } from "react";
import { getStatus } from "../../../../utils/statusUtil";
import categoryNameMap from "../../../../constants/categoryNameMap";
import categoryColorMap from "../../../../constants/categoryColorMap";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkButton from "./BookmarkButton";

const EventDetail = ({
  articleId,
  status: apiStatus,
  title,
  vendors,
  startDate,
  dueDate,
  created_at,
  content,
  category_name,
  is_bookmarked,
  bookmark_count
}) => {
  const [bookmarkCount, setBookmarkCount] = useState(bookmark_count);

  const handleBookmarkToggle = (bookmarked) => {
    setBookmarkCount((prev) => bookmarked ? prev + 1 : prev - 1);
  };
  const mainVendor =
    Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;

  const vendorName = mainVendor?.vendor_name || "";

  const eventData = {
    title,
    content,
    start_date: startDate,
    due_date: dueDate,
    vendors: { vendor_name: vendorName }
  };

  const status = getStatus(apiStatus);

  const displayCategoryName = category_name
    ? categoryNameMap[category_name] || category_name
    : "";

  const categoryColor = category_name
    ? categoryColorMap[category_name] ||
      "border-gray-300 text-gray-700 bg-gray-100 ml-2"
    : "";

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100">
        <DetailInfoTitle
          status={status}
          category_name={category_name}
          categoryColor={categoryColor}
          displayCategoryName={displayCategoryName}
          title={title}
          eventData={eventData}
          vendors={vendors}
          created_at={created_at}
          dueDate={dueDate}
          bookmark={bookmarkCount}
        />
      </div>

      <div className="p-6 md:p-8 min-h-[200px]">

        <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
        <BookmarkButton articleId={articleId} isBookmarked={is_bookmarked} onToggle={handleBookmarkToggle} />
      </div>
    </div>
  );
};

export default EventDetail;