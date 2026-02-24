import React from "react";
import Badge from "../../common/Badge";
import OriginalUrlBtn from "./OriginalUrlBtn";
import AddToCalendar from "./AddToCalendar";

const DetailInfoTitle = ({ status, category_name, categoryColor, displayCategoryName, title, eventData, vendors, created_at, dueDate }) => (
  <>
    <div className="flex items-center gap-2 mb-4">
      {category_name && (
        <Badge color={categoryColor} text={displayCategoryName} />
      )}
      <Badge color={status.color} text={status.text} />
    </div>
    <div className="flex justify-between items-start gap-4 mb-2">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
        {title}
      </h1>
      <div className="shrink-0">
        <AddToCalendar event={eventData} />
      </div>
    </div>
    {Array.isArray(vendors) && vendors.length > 0 && (
      <div className="flex flex-row flex-wrap gap-2 mb-4">
        {vendors.map((vendor) => (
          <OriginalUrlBtn
            key={vendor.vendor_id}
            vendor_name={vendor.vendor_name}
            original_url={vendor.original_url}
          />
        ))}
      </div>
    )}
    <div className="flex flex-row items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
      <div className="flex items-center gap-2"><span className="font-medium text-gray-800">게시일자:</span><span>{created_at}</span></div>
      <div className="w-px h-3 bg-gray-300 mx-2" />
      <div className="flex items-center gap-2"><span className="font-medium text-gray-800">마감일:</span><span>{dueDate}</span></div>
    </div>
  </>
);

export default DetailInfoTitle;
