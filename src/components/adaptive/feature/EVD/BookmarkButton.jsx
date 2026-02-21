import React from "react";

const BookmarkButton = () => (
  <button
    className="w-fit inline-flex items-center gap-2 px-6 py-3 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 shadow-sm text-sm font-bold transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-gray-700"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21l-5-4.5L7 21V5a2 2 0 012-2h6a2 2 0 012 2v16z"
      />
    </svg>
    북마크하기
  </button>
);

export default BookmarkButton;
