import React from "react";
import { getStatus } from "../../../../utils/statusUtil";
import categoryNameMap from "../../../../constants/categoryNameMap";
import categoryColorMap from "../../../../constants/categoryColorMap";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkCount from "./BookmarkCount";

const EventDetail = ({ title, vendors, startDate, dueDate, created_at, content, category_name, is_bookmarked, bookmark_count }) => {
  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const vendorName = mainVendor?.vendor_name || "";
  const originalUrl = mainVendor?.original_url || null;
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
        />
      </div>
      <div className="p-6 md:p-8 min-h-[200px]">
        <div className="mb-4">
          <BookmarkCount count={bookmark_count} />
        </div>
        <div className="prose text-gray-800 whitespace-pre-line leading-relaxed">{content}</div>
      </div>
      {originalUrl && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm text-sm font-bold transition-colors">
            원문 공지 보러가기 →
          </a>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
