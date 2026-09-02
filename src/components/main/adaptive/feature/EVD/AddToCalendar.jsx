import React, { useState } from "react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, "");
};

// Google Calendar / ICS 표준은 종료일을 배타적(exclusive)으로 처리하므로
// 포함적 종료일(ends_on)에 하루를 더해 전달해야 마지막 날이 올바르게 포함됨
const formatExclusiveEndDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day + 1);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
};

const getGoogleCalendarUrl = (event) => {
  const { title, content, starts_on, ends_on, vendors } = event;
  const start = formatDate(starts_on);
  const end = formatExclusiveEndDate(ends_on);
  const details = `주관: ${vendors?.name || ""}\n\n${content || ""}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
};

const downloadIcsFile = (event) => {
  const { title, content, starts_on, ends_on, vendors } = event;
  const start = formatDate(starts_on);
  const end = formatExclusiveEndDate(ends_on);
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
DESCRIPTION:${vendors?.name ? `[${vendors.name}] ` : ""}${content?.replace(/\n/g, "\\n") || ""}
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