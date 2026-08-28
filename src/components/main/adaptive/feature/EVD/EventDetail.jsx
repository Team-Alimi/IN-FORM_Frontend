import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatus } from "@/utils/statusUtil";
import Badge from "@/components/main/adaptive/common/Badge";
import OriginalUrlBtn from "@/components/main/adaptive/feature/EVD/OriginalUrlBtn";
import AddToCalendar from "@/components/main/adaptive/feature/EVD/AddToCalendar";
import ShareButton from "@/components/main/adaptive/feature/EVD/ShareButton";
import BookmarkButton from "@/components/main/adaptive/feature/EVD/BookmarkButton";

const isHTML = (str) => str && /<\/?(p|br|div|span|img|a|strong|b|i|u|em|table|thead|tbody|tr|td|th|ul|ol|li|h[1-6])(\s|>|\/)/i.test(str);
const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

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

/******** 이미지 확대 모달 (공통) ********/
const ImageModal = ({ imageAttachments, selectedIndex, onClose, onPrev, onNext, onTouchStart, onTouchMove, onTouchEnd }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity"
    onClick={onClose}
  >
    <div
      className="relative max-w-5xl w-full h-full flex items-center justify-center"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {selectedIndex > 0 && (
        <button className="hidden md:flex absolute left-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50" onClick={onPrev}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      <img
        src={imageAttachments[selectedIndex].attachment_url}
        alt="확대된 첨부파일"
        className="max-w-full max-h-full object-contain rounded-lg pointer-events-none select-none"
        onClick={(e) => e.stopPropagation()}
      />
      {selectedIndex < imageAttachments.length - 1 && (
        <button className="hidden md:flex absolute right-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50" onClick={onNext}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}
    </div>
  </div>
);

/******** 첨부파일 공통 훅 ********/
const useImageViewer = (attachments) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const imageAttachments = (attachments || []).filter((a) => IMAGE_EXTS.test(a.attachment_url));
  const fileAttachments = (attachments || []).filter((a) => !IMAGE_EXTS.test(a.attachment_url));

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < imageAttachments.length - 1) setSelectedIndex(selectedIndex + 1);
  };
  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && selectedIndex < imageAttachments.length - 1) setSelectedIndex(selectedIndex + 1);
    if (distance < -50 && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return {
    selectedIndex,
    setSelectedIndex,
    imageAttachments,
    fileAttachments,
    handlePrevImage,
    handleNextImage,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

/******** 모바일 레이아웃 ********/
const MobileLayout = ({
  articleId,
  status,
  title,
  vendors,
  startDate,
  dueDate,
  created_at,
  content,
  category_name,
  is_bookmarked,
  bookmark_count,
  attachments,
}) => {
  const {
    selectedIndex,
    setSelectedIndex,
    imageAttachments,
    fileAttachments,
    handlePrevImage,
    handleNextImage,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useImageViewer(attachments);

  return (
    <div className="w-full bg-white">
      {/* 제목 + 메타 */}
      <div className="px-5 pt-6 pb-5">
        {/* 카테고리 + 상태 뱃지 */}
        <div className="flex items-center gap-2 mb-3">
          {category_name && <Badge category={category_name} />}
          <Badge color={status.color} text={status.text} />
        </div>

        {/* 대형 굵은 제목 */}
        <h1 className="text-[22px] font-bold text-gray-900 leading-snug mb-4">
          {title}
        </h1>

        {/* 제공처 (원문 링크 버튼) */}
        {Array.isArray(vendors) && vendors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {vendors.map((vendor) => (
              <OriginalUrlBtn
                key={vendor.vendor_id}
                vendor_name={vendor.vendor_name}
                original_url={vendor.original_url}
              />
            ))}
          </div>
        )}

        {/* 날짜 정보 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span><span className="font-medium text-gray-600">게시일</span> {created_at?.slice(0, 10)}</span>
          <span><span className="font-medium text-gray-600">마감일</span> {dueDate}</span>
          <span><span className="font-medium text-gray-600">북마크</span> {bookmark_count}</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100" />

      {/* 본문 */}
      <div className="px-5 py-5 min-h-[200px]">
        {imageAttachments.length > 0 && (
          <div className="mb-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {imageAttachments.map((a, idx) => (
              <img
                key={a.file_id}
                src={a.attachment_url}
                alt={`첨부파일 ${a.file_id}`}
                className="h-52 w-auto shrink-0 rounded-xl border border-gray-100 object-contain snap-start cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedIndex(idx)}
              />
            ))}
          </div>
        )}

        {isHTML(content) ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: processHTML(content) }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
            {linkifyText(content)}
          </div>
        )}

        {fileAttachments.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-500 mb-2">첨부파일</p>
            <div className="flex flex-col gap-1.5">
              {fileAttachments.map((a) => (
                <a
                  key={a.file_id}
                  href={a.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <span>📎</span>
                  <span className="truncate">{a.attachment_url.split("/").pop()}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedIndex !== null && imageAttachments[selectedIndex] && (
        <ImageModal
          imageAttachments={imageAttachments}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </div>
  );
};

/******** 데스크톱 레이아웃 (기존 유지) ********/
const DesktopLayout = ({
  articleId,
  status,
  title,
  vendors,
  startDate,
  dueDate,
  created_at,
  content,
  category_name,
  is_bookmarked,
  bookmark_count,
  attachments,
}) => {
  const navigate = useNavigate();
  const [bookmarkCount, setBookmarkCount] = useState(bookmark_count);
  const {
    selectedIndex,
    setSelectedIndex,
    imageAttachments,
    fileAttachments,
    handlePrevImage,
    handleNextImage,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useImageViewer(attachments);

  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const vendorName = mainVendor?.vendor_name || "";
  const eventData = {
    title,
    content,
    start_date: startDate,
    due_date: dueDate,
    vendors: { vendor_name: vendorName },
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 뒤로가기 */}
      <div className="px-6 md:px-8 pt-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-800 hover:text-gray-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          공지사항
        </button>
      </div>

      {/* 제목·메타 */}
      <div className="p-6 md:p-8 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          {category_name && <Badge category={category_name} />}
          <Badge color={status.color} text={status.text} />
        </div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
          <div className="shrink-0 flex items-center gap-2">
            <AddToCalendar event={eventData} />
            <ShareButton title={title} />
          </div>
        </div>
        {Array.isArray(vendors) && vendors.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2 mb-4">
            {vendors.map((vendor) => (
              <OriginalUrlBtn
                key={vendor.vendor_id}
                vendor_name={vendor.vendor_name}
                original_url={vendor.original_url}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 rounded-xl">
          <div className="flex items-center gap-1.5"><span className="font-medium text-gray-600">게시일:</span><span>{created_at?.slice(0, 10)}</span></div>
          <div className="flex items-center gap-1.5"><span className="font-medium text-gray-600">마감일:</span><span>{dueDate}</span></div>
          <div className="flex items-center gap-1.5"><span className="font-medium text-gray-600">북마크</span><span>{bookmarkCount}</span></div>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-6 md:p-8 min-h-[200px]">
        {imageAttachments.length > 0 && (
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {imageAttachments.map((a, idx) => (
              <img
                key={a.file_id}
                src={a.attachment_url}
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
        {fileAttachments.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 mb-2">첨부파일</p>
            <div className="flex flex-col gap-1.5">
              {fileAttachments.map((a) => (
                <a
                  key={a.file_id}
                  href={a.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <span>📎</span>
                  <span className="truncate">{a.attachment_url.split("/").pop()}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedIndex !== null && imageAttachments[selectedIndex] && (
        <ImageModal
          imageAttachments={imageAttachments}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </div>
  );
};

/******** 진입점: isMobile에 따라 레이아웃 선택 ********/
const EventDetail = ({ isMobile = false, status: apiStatus, ...props }) => {
  const status = getStatus(apiStatus);
  return isMobile
    ? <MobileLayout {...props} status={status} />
    : <DesktopLayout {...props} status={status} />;
};

export default EventDetail;
