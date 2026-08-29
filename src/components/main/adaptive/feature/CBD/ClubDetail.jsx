import { useState } from "react";
import { useNavigate } from "react-router-dom";
import urlIcon from "@/assets/icons/url.svg";
import { getStatus } from "@/utils/statusUtil";

// ─── 유틸 함수 ────────────────────────────────────────────────────────────────

const isHTML = (str) =>
  str &&
  /<\/?(p|br|div|span|img|a|strong|b|i|u|em|table|thead|tbody|tr|td|th|ul|ol|li|h[1-6])(\s|>|\/)/i.test(str);

// HTML 콘텐츠: <a> 태그에 target="_blank" 추가
const processHTML = (html) =>
  html.replace(
    /<a(?![^>]*target=)([^>]*)>/g,
    '<a$1 target="_blank" rel="noopener noreferrer">'
  );

// 일반 텍스트: URL을 하이퍼링크로 변환
const linkifyText = (text) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

// ─── 이미지 뷰어 훅 ───────────────────────────────────────────────────────────

const useImageViewer = (attachments) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const validAttachments = attachments || [];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0)
      setSelectedIndex(selectedIndex - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < validAttachments.length - 1)
      setSelectedIndex(selectedIndex + 1);
  };

  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && selectedIndex < validAttachments.length - 1)
      setSelectedIndex(selectedIndex + 1);
    if (distance < -50 && selectedIndex > 0)
      setSelectedIndex(selectedIndex - 1);
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return {
    selectedIndex,
    setSelectedIndex,
    validAttachments,
    handlePrevImage,
    handleNextImage,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

// ─── 이미지 확대 모달 ─────────────────────────────────────────────────────────

const ImageModal = ({
  selectedIndex,
  setSelectedIndex,
  validAttachments,
  handlePrevImage,
  handleNextImage,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}) => {
  if (selectedIndex === null || !validAttachments[selectedIndex]) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => setSelectedIndex(null)}
    >
      <div
        className="relative max-w-5xl w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full z-50"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIndex(null);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {selectedIndex > 0 && (
          <button
            className="hidden md:flex absolute left-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full z-50"
            onClick={handlePrevImage}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <img
          src={validAttachments[selectedIndex].file_url}
          alt="확대된 첨부파일"
          className="max-w-full max-h-full object-contain rounded-lg pointer-events-none select-none"
          onClick={(e) => e.stopPropagation()}
        />

        {selectedIndex < validAttachments.length - 1 && (
          <button
            className="hidden md:flex absolute right-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full z-50"
            onClick={handleNextImage}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── 모바일 레이아웃 ──────────────────────────────────────────────────────────

const MobileLayout = ({ title, status, vendors, categories, content, linkUrl, attachments }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);
  const [coverTouchStartX, setCoverTouchStartX] = useState(null);
  const imageViewer = useImageViewer(attachments);
  const { validAttachments, setSelectedIndex } = imageViewer;

  const statusInfo = getStatus(status);

  // 커버 캐러셀 스와이프 핸들러
  const handleCoverTouchStart = (e) => setCoverTouchStartX(e.targetTouches[0].clientX);
  const handleCoverTouchEnd = (e) => {
    if (coverTouchStartX === null) return;
    const distance = coverTouchStartX - e.changedTouches[0].clientX;
    if (distance > 50 && coverIndex < validAttachments.length - 1)
      setCoverIndex((prev) => prev + 1);
    if (distance < -50 && coverIndex > 0)
      setCoverIndex((prev) => prev - 1);
    setCoverTouchStartX(null);
  };

  // 해시태그: vendors + category
  const hashtags = Array.isArray(vendors) ? vendors.map((v) => v.vendor_name) : [];
  const categoryName = categories?.category_name;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "동아리", url });
      } catch (err) {
        if (err.name !== "AbortError") console.error("공유 실패:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 커버 이미지 캐러셀 + 헤더 버튼 오버레이 */}
      <div
        className="relative w-full h-60 bg-linear-to-br from-[#e8efff] to-[#d4e4ff] overflow-hidden"
        onTouchStart={handleCoverTouchStart}
        onTouchEnd={handleCoverTouchEnd}
      >
        {validAttachments.length > 0 && (
          <img
            src={validAttachments[coverIndex].file_url}
            alt={`동아리 커버 ${coverIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setSelectedIndex(coverIndex)}
          />
        )}
        {/* 도트 인디케이터 */}
        {validAttachments.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {validAttachments.map((_, i) => (
              <button
                key={i}
                onClick={() => setCoverIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === coverIndex ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
        {/* 뒤로가기 + 공유 버튼 */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-[52px]">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            aria-label={copied ? "링크 복사됨" : "공유하기"}
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M12 3v13.5m0-13.5-3 3m3-3 3 3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 메타 영역 */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[22px] font-bold text-gray-900 leading-snug mb-3">{title}</h1>
        {status && (
          <div className="mb-3">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        )}
        {(hashtags.length > 0 || categoryName) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {hashtags.map((tag, i) => (
              <span key={i} className="text-sm text-[#4068f7]">#{tag}</span>
            ))}
            {categoryName && (
              <span className="text-sm text-[#4068f7]">#{categoryName}</span>
            )}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100" />

      {/* 본문 */}
      <div className="px-5 py-5">
        {isHTML(content) ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processHTML(content) }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
            {linkifyText(content)}
          </div>
        )}
      </div>

      <ImageModal {...imageViewer} />
    </div>
  );
};

// ─── 데스크톱 레이아웃 ────────────────────────────────────────────────────────

const DesktopLayout = ({ title, vendors, startDate, dueDate, created_at, content, linkUrl, attachments }) => {
  const navigate = useNavigate();
  const imageViewer = useImageViewer(attachments);
  const { validAttachments, setSelectedIndex } = imageViewer;

  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 md:px-8 pt-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-800 hover:text-gray-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          동아리
        </button>
      </div>

      {/* 헤더 */}
      <div className="p-6 md:p-8 border-b border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          {mainVendor && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">주관:</span>
              <span>{mainVendor.vendor_name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-600">게시일:</span>
            <span>{created_at?.slice(0, 10)}</span>
          </div>
          <div className="w-full" />
          {startDate && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">시작일:</span>
              <span>{startDate}</span>
            </div>
          )}
          {dueDate && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">마감일:</span>
              <span>{dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-6 md:p-8 min-h-[200px]">
        {validAttachments.length > 0 && (
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {validAttachments.map((a, idx) => (
              <img
                key={a.file_id}
                src={a.file_url}
                alt={`첨부파일 ${a.file_id}`}
                className="h-64 w-auto shrink-0 rounded-xl border border-gray-100 object-contain snap-start cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedIndex(idx)}
              />
            ))}
          </div>
        )}

        {isHTML(content) ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processHTML(content) }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
            {linkifyText(content)}
          </div>
        )}
      </div>

      {/* 원문 링크 */}
      {linkUrl && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <img src={urlIcon} alt="지원 링크" className="w-5 h-5" />
            지원하러 가기
          </a>
        </div>
      )}

      <ImageModal {...imageViewer} />
    </div>
  );
};

// ─── ClubDetail ───────────────────────────────────────────────────────────────

const ClubDetail = ({ isMobile, ...props }) => {
  if (isMobile) return <MobileLayout {...props} />;
  return <DesktopLayout {...props} />;
};

export default ClubDetail;
