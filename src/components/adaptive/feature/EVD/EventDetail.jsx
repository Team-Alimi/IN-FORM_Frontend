import React from "react";
import { getStatus } from "../../../../utils/statusUtil";
import AddToCalendar from "./AddToCalendar";

const EventDetail = ({ title, vendors, startDate, dueDate, created_at, content }) => {
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

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-bold border rounded-full ${status.color}`}>{status.text}</span>
        </div>
        <div className="flex justify-between items-start gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          <div className="shrink-0">
            <AddToCalendar event={eventData} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">주관:</span><span>{vendorName}</span></div>
          <div className="hidden sm:block w-px h-3 bg-gray-300" />
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">게시일자:</span><span>{created_at}</span></div>
        </div>
      </div>
      <div className="p-6 md:p-8 min-h-[200px]">
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
