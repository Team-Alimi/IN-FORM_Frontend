import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatus } from "../../../../utils/statusUtil";
import { FILTER_OPTIONS } from "../../../../constants/filterOption";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkButton from "./BookmarkButton";

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


const EventDetail = ({
  articleId,
  status: apiStatus,
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
  const [selectedImage, setSelectedImage] = useState(null);

  const handleBookmarkToggle = (bookmarked) => {
    setBookmarkCount((prev) => bookmarked ? prev + 1 : prev - 1);
  };

  const mainVendor =
    Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const vendorName = mainVendor?.vendor_name || "";

  const eventData = {
    title,
    content,
    start_date: startDate,
    due_date: dueDate,
    vendors: { vendor_name: vendorName }
  };

  const status = getStatus(apiStatus);

  const categoryOpt = category_name
    ? FILTER_OPTIONS.find((o) => o.key === category_name)
    : null;

  const displayCategoryName = categoryOpt?.label ?? category_name ?? "";

  const categoryColor = categoryOpt
    ? `${categoryOpt.tagBg} ${categoryOpt.borderColor} ${categoryOpt.textColor} border`
    : "border-gray-300 text-gray-700 bg-gray-100 border";

  const imageAttachments = (attachments || []).filter((a) => IMAGE_EXTS.test(a.attachment_url));
  const fileAttachments = (attachments || []).filter((a) => !IMAGE_EXTS.test(a.attachment_url));

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
          공지사항
        </button>
      </div>
      <div className="p-6 md:p-8 border-b border-gray-100">
        <DetailInfoTitle
          status={status}
          category_name={category_name}
          categoryColor={categoryColor}
          displayCategoryName={displayCategoryName}
          title={title}
          eventData={eventData}
          vendors={vendors}
          created_at={created_at}
          dueDate={dueDate}
          bookmark={bookmarkCount}
        />
      </div>

      <div className="p-6 md:p-8 min-h-[200px]">
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

        {/* 첨부 이미지 */}
        {imageAttachments.length > 0 && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {imageAttachments.map((a) => (
              <img
                key={a.file_id}
                src={a.attachment_url}
                alt={`첨부파일 ${a.file_id}`}
                className="h-64 w-auto shrink-0 rounded-xl border border-gray-100 object-contain snap-start cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(a.attachment_url)}
              />
            ))}
          </div>
        )}

        {/* 첨부 파일 */}
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

      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
        <BookmarkButton articleId={articleId} isBookmarked={is_bookmarked} onToggle={handleBookmarkToggle} />
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all z-50"
              onClick={() => setSelectedImage(null)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="확대된 첨부파일"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
