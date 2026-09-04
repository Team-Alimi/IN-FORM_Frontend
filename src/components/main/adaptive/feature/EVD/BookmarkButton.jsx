import { useEffect, useState } from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { postBookmark } from "@/api/main/bookmarks";

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
      aria-label={bookmarked ? "북마크 해제" : "북마크"}
      className={`w-10 h-10 flex items-center justify-center transition-all ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {bookmarked
        ? <BsBookmarkFill size={22} className="text-primary" />
        : <BsBookmark size={22} color="#9ca3af" />
      }
    </button>
  );
};

export default BookmarkButton;
