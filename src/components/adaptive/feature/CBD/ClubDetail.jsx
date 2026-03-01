import { useState } from "react";
import { useNavigate } from "react-router-dom";
import urlIcon from "../../../../assets/icons/url.svg";

const isHTML = (str) => str && /<\/?(p|br|div|span|img|a|strong|b|i|u|em|table|thead|tbody|tr|td|th|ul|ol|li|h[1-6])(\s|>|\/)/i.test(str);

// HTML 콘텐츠: <a> 태그에 target="_blank" 추가 (이미 있는 경우 제외)
const processHTML = (html) =>
  html.replace(/<a(?![^>]*target=)([^>]*)>/g, '<a$1 target="_blank" rel="noopener noreferrer">');

// 일반 텍스트 콘텐츠: URL을 하이퍼링크로 변환
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

const ClubDetail = ({ title, vendors, startDate, dueDate, created_at, content, linkUrl, attachments }) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const validAttachments = attachments || [];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < validAttachments.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedIndex < validAttachments.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
    if (isRightSwipe && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };


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
            <span>{created_at}</span>
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
        {/* 첨부 이미지 */}
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

      {/* 이미지 확대 모달 */}
      {selectedIndex !== null && validAttachments[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {selectedIndex > 0 && (
              <button
                className="hidden md:flex absolute left-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50"
                onClick={handlePrevImage}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
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
                className="hidden md:flex absolute right-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50"
                onClick={handleNextImage}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 원문 링크 */}
      {linkUrl && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm text-m bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <img src={urlIcon} alt="지원 링크" className="w-5 h-5" />
            지원하러 가기
          </a>
        </div>
      )}
    </div>
  );
};

export default ClubDetail;
