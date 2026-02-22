import React from "react";
import bookmarkIcon from "../../../../assets/icons/bookmark.svg";

const BookmarkButton = () => (
  <button
    className="w-fit inline-flex items-center gap-2 px-6 py-3 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 shadow-sm text-m font-medium transition-colors"
  >
    <img src={bookmarkIcon} alt="북마크" className="w-5 h-5" />
    북마크하기
  </button>
);

export default BookmarkButton;
