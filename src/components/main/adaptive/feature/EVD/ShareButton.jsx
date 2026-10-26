import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ShareButton = ({ title, className = "w-8 h-8 text-gray-600", iconClassName = "w-5 h-5 md:w-6 md:h-6" }) => {
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), []);

  const showFeedback = (message) => {
    window.clearTimeout(feedbackTimer.current);
    setFeedback(message);
    feedbackTimer.current = window.setTimeout(() => setFeedback(""), 2500);
  };

  const copyLink = async (url) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(textarea);
    try {
      textarea.focus();
      textarea.select();
      if (!document.execCommand("copy")) throw new Error("Copy failed");
    } finally {
      textarea.remove();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: title || "공지사항", url });
        showFeedback("링크가 복사되었습니다.");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await copyLink(url);
      showFeedback("링크가 복사되었습니다.");
    } catch {
      showFeedback("링크를 복사하지 못했습니다.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label="공유하기"
        title="공유하기"
        className={`${className} flex items-center justify-center transition-all cursor-pointer`}
      >
        {feedback === "링크가 복사되었습니다." ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={iconClassName}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={iconClassName}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M12 3v13.5m0-13.5-3 3m3-3 3 3" />
          </svg>
        )}
      </button>
      {feedback && createPortal(
        <div role="status" className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[110] rounded-full bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg whitespace-nowrap pointer-events-none">
          {feedback}
        </div>,
        document.body
      )}
    </>
  );
};

export default ShareButton;
