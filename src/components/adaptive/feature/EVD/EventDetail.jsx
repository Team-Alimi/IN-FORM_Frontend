import React, {useState} from "react";
import { getStatus } from "../../../../utils/statusUtil";


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, "");
};

const getGoogleCalendarUrl = (event) => {
  const { title, content, start_date, due_date, vendors } = event;
  const start = formatDate(start_date);
  const end = formatDate(due_date);
  const details = `주관: ${vendors?.vendor_name || ""}\n\n${content || ""}`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
};

const downloadIcsFile = (event) => {
  const { title, content, start_date, due_date, vendors } = event;
  const start = formatDate(start_date);
  const end = formatDate(due_date);
  
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InhaInfo//Event//KO
BEGIN:VEVENT
UID:${Date.now()}@inhainfo.com
DTSTAMP:${start}T000000Z
DTSTART;VALUE=DATE:${start}
DTEND;VALUE=DATE:${end}
SUMMARY:${title}
DESCRIPTION:${vendors?.vendor_name ? `[${vendors.vendor_name}] ` : ""}${content?.replace(/\n/g, "\\n") || ""}
END:VEVENT
END:VCALENDAR`.trim();

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `${title}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AddToCalendar = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleClick = () => {
    const url = getGoogleCalendarUrl(event);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  const handleIcsClick = () => {
    downloadIcsFile(event);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center transition-all shadow-sm"
        title="캘린더에 추가"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <button 
              onClick={handleGoogleClick} 
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50"
            >
              🗓️ 구글 캘린더
            </button>
            <button 
              onClick={handleIcsClick} 
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              📥 내 캘린더 저장
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const EventDetail = ({ title, vendor, startDate, dueDate, created_at, content, linkUrl }) => {
  const eventData = {
    title,
    content,
    start_date: startDate,
    due_date: dueDate,
    vendors: { vendor_name: vendor }
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
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">주관:</span><span>{vendor}</span></div>
          <div className="hidden sm:block w-px h-3 bg-gray-300" />
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">게시일자:</span><span>{created_at}</span></div>
        </div>
      </div>
      <div className="p-6 md:p-8 min-h-[200px]">
        <div className="prose text-gray-800 whitespace-pre-line leading-relaxed">{content}</div>
      </div>
      {linkUrl && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm text-sm font-bold transition-colors">
            원문 공지 보러가기 →
          </a>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
