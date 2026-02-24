import { useState } from "react";
import { getStatus } from "../../../../utils/statusUtil";
import categoryNameMap from "../../../../constants/categoryNameMap";
import categoryColorMap from "../../../../constants/categoryColorMap";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkButton from "./BookmarkButton";

const isHTML = (str) => str && /<[a-z][\s\S]*>/i.test(str);

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

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
  const [bookmarkCount, setBookmarkCount] = useState(bookmark_count);

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

  const displayCategoryName = category_name
    ? categoryNameMap[category_name] || category_name
    : "";

  const categoryColor = category_name
    ? categoryColorMap[category_name] ||
      "border-gray-300 text-gray-700 bg-gray-100 ml-2"
    : "";

  const imageAttachments = (attachments || []).filter((a) => IMAGE_EXTS.test(a.attachment_url));
  const fileAttachments  = (attachments || []).filter((a) => !IMAGE_EXTS.test(a.attachment_url));

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        )}

        {/* 첨부 이미지 */}
        {imageAttachments.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {imageAttachments.map((a) => (
              <img
                key={a.file_id}
                src={a.attachment_url}
                alt={`첨부파일 ${a.file_id}`}
                className="w-full rounded-xl border border-gray-100 object-contain"
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
    </div>
  );
};

export default EventDetail;
