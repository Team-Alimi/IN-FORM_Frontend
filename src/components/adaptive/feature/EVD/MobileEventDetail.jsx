import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getStatus } from "../../../../utils/statusUtil";
import { FILTER_OPTIONS } from "../../../../constants/filterOption";
import DetailInfoTitle from "./DetailInfoTitle";
import BookmarkButton from "./BookmarkButton";
import BottomSheet from "../../../mobile/common/BottomSheet";

const MobileEventDetail = ({ isOpen, onClose, articleId, status: apiStatus, title, vendors, startDate, dueDate, created_at, content, category_name, is_bookmarked, bookmark_count, isFetching }) => {
  const [bookmarkCount, setBookmarkCount] = useState(bookmark_count || 0);
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // 서버에서 데이터를 새로 가져오는 중(Fetching)이 아닐 때만 동기화
    if (!isFetching) {
      if (bookmark_count !== undefined) {
        setBookmarkCount(bookmark_count);
      }
      if (is_bookmarked !== undefined) {
        setIsBookmarkedState(is_bookmarked);
      }
    }
  }, [bookmark_count, is_bookmarked, isFetching]);

  const handleBookmarkToggle = (bookmarked) => {
    setIsBookmarkedState(bookmarked);
    setBookmarkCount((prev) => (bookmarked ? (prev || 0) + 1 : Math.max(0, (prev || 0) - 1)));

    // 관련 쿼리 무효화하여 최신 상태 유지 (캐시 갱신)
    queryClient.invalidateQueries({ queryKey: ["eventDetail", articleId] });
    // 목록 쿼리도 무효화하여 캘린더나 리스트의 북마크 수도 업데이트 되도록 함
    queryClient.invalidateQueries({ queryKey: ["monthlyAll"] });
  };

  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
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

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[85vh] overflow-y-auto">
      <div className="border-b border-gray-200 pb-4 mb-4">
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
      <div className="min-h-[100px]">
        <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</div>
      </div>
      <div className="mt-6 flex justify-center">
        <BookmarkButton
          articleId={articleId}
          isBookmarked={isBookmarkedState}
          onToggle={handleBookmarkToggle}
        />
      </div>
    </BottomSheet>
  );
};

export default MobileEventDetail;
