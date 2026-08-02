import { useEffect, useState } from "react";
import bookmarkIcon from "@/assets/icons/bookmark.svg";
import PressedBookmarkIcon from "@/assets/icons/bookmark_pressed.svg";
import { postBookmark } from "@/api/bookmarks";

const BookmarkButton = ({ articleId, articleType = "SCHOOL", isBookmarked = false, onToggle }) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const handleClick = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const result = await postBookmark(articleType, articleId);
      setBookmarked(result);
      onToggle?.(result);
    } catch (err) {
      console.error("북마크 처리 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full max-w-md inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm text-m
        ${bookmarked
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <img src={bookmarked ? PressedBookmarkIcon : bookmarkIcon} alt="북마크" className="w-5 h-5" />
      {bookmarked ? "북마크 완료" : "북마크하기"}
    </button>
  );
};

export default BookmarkButton;
