import React from "react";
import { getStatus } from "../../../../utils/statusUtil";
import categoryNameMap from "../../../../constants/categoryNameMap";
import categoryColorMap from "../../../../constants/categoryColorMap";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkCount from "./BookmarkCount";
import BookmarkButton from "./BookmarkButton";

const EventDetail = ({ title, vendors, startDate, dueDate, created_at, content, category_name, is_bookmarked, bookmark_count, isMobile }) => {
  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const vendorName = mainVendor?.vendor_name || "";
  const eventData = {
    title,
    content,
    start_date: startDate,
    due_date: dueDate,
    vendors: { vendor_name: vendorName }
  };
  const status = getStatus(startDate, dueDate);
  const displayCategoryName = category_name ? (categoryNameMap[category_name] || category_name) : "";
  const categoryColor = category_name ? (categoryColorMap[category_name] || "border-gray-300 text-gray-700 bg-gray-100 ml-2") : "";

  return (
    <div className={isMobile
      ? "w-full bg-white rounded-none border-none shadow-none"
      : "w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    }>
      <div className={isMobile ? "p-4 border-b border-gray-100" : "p-6 md:p-8 border-b border-gray-100"}>
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
        />
      </div>
      <div className={isMobile ? "p-4 min-h-[200px]" : "p-6 md:p-8 min-h-[200px]"}>
        <div className="mb-4">
          <BookmarkCount count={bookmark_count} />
        </div>
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</div>
      </div>
      {!isMobile && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
          <BookmarkButton />
        </div>
      )}
    </div>
  );
};

export default EventDetail;
