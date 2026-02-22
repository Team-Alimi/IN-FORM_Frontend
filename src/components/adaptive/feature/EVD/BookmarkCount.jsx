import React from "react";

const BookmarkCount = ({ count }) => (
  <div className="flex items-center justify-between bg-blue-50 rounded-xl px-5 py-3.5 w-fit min-w-[220px]">
    <span className="text-gray-500 text-sm font-medium">북마크 수</span>
    <span className="text-blue-700 text-base font-bold">{count}명</span>
  </div>
);

export default BookmarkCount;
