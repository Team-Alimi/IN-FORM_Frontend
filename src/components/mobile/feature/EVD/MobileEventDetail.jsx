import React from "react";

// 샘플코드

const MobileEventDetail = ({ title, vendors, startDate, dueDate, created_at, content }) => {
  return (
    <div className="bg-white min-h-screen px-4 py-6 text-gray-900">
      <h1 className="text-xl font-bold mb-2">{title}</h1>
      <div className="text-xs text-gray-500 mb-1">주최: {vendors?.join(", ")}</div>
      <div className="text-xs text-gray-500 mb-1">기간: {startDate} ~ {dueDate}</div>
      <div className="text-xs text-gray-400 mb-4">등록일: {created_at}</div>
      <div className="text-sm leading-relaxed whitespace-pre-line">{content}</div>
    </div>
  );
};

export default MobileEventDetail;
