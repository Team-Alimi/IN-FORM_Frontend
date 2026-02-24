import { useState } from "react";
import { getStatus } from "../../../../utils/statusUtil";
import categoryNameMap from "../../../../constants/categoryNameMap";
import categoryColorMap from "../../../../constants/categoryColorMap";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkButton from "./BookmarkButton";
import BottomSheet from "../../../mobile/common/BottomSheet";

const MobileEventDetail = ({ isOpen, onClose, articleId, status: apiStatus, title, vendors, startDate, dueDate, created_at, content, category_name, is_bookmarked, bookmark_count }) => {
  const [bookmarkCount, setBookmarkCount] = useState(bookmark_count);

  const handleBookmarkToggle = (bookmarked) => {
    setBookmarkCount((prev) => bookmarked ? prev + 1 : prev - 1);
  };

  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const vendorName = mainVendor?.vendor_name || "";
  const eventData = {
    title,
    content,
    start_date: startDate,
    due_date: dueDate,
    vendors: { vendor_name: vendorName }
  };
  const status = getStatus(apiStatus);
  const displayCategoryName = category_name ? (categoryNameMap[category_name] || category_name) : "";
  const categoryColor = category_name ? (categoryColorMap[category_name] || "border-gray-300 text-gray-700 bg-gray-100 ml-2") : "";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[85vh] overflow-y-auto">
      <div className="border-b border-gray-200 pb-4 mb-4">
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
      <div className="min-h-[100px]">
        <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</div>
      </div>
      <div className="mt-6 flex justify-center">
        <BookmarkButton articleId={articleId} isBookmarked={is_bookmarked} onToggle={handleBookmarkToggle} />
      </div>
    </BottomSheet>
  );
};

export default MobileEventDetail;
