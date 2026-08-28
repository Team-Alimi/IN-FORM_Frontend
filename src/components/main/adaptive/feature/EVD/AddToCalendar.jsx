import React, { useState } from "react";

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
        className="w-8 h-8 text-gray-600 flex items-center justify-center transition-all"
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
              🗓️ 구글 캘린더에 저장
            </button>
            <button 
              onClick={handleIcsClick} 
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              📥 내 캘린더에 저장
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddToCalendar;