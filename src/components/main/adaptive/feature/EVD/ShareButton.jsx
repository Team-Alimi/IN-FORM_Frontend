import { useState } from "react";

const ShareButton = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: title || "공지사항", url });
      } catch (err) {
        // 사용자가 직접 취소한 경우 무시
        if (err.name !== "AbortError") {
          console.error("공유 실패:", err);
        }
      }
    } else {
      // Web Share API 미지원 환경 (일부 데스크톱 브라우저)
      try {
        if (navigator.clipboard?.writeText) {
          // 최신 브라우저: Clipboard API 사용
          await navigator.clipboard.writeText(url);
        } else {
          // 구형 브라우저 / 비HTTPS 환경 대체 방법 (execCommand)
          const textarea = document.createElement("textarea");
          textarea.value = url;
          textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      title={copied ? "링크 복사됨" : "공유하기"}
      className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-all shadow-sm"
    >
      {copied ? (
        // 복사 완료: 체크마크 아이콘
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        // 기본: 공유 아이콘 (화살표가 박스 위로 나가는 iOS 스타일)
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M12 3v13.5m0-13.5-3 3m3-3 3 3" />
        </svg>
      )}
    </button>
  );
};

export default ShareButton;
