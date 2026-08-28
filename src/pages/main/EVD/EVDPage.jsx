import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";
import MobileFooter from "@/components/main/mobile/common/MobileFooter";
import EventDetail from "@/components/main/adaptive/feature/EVD/EventDetail";
import BookmarkButton from "@/components/main/adaptive/feature/EVD/BookmarkButton";
import ShareButton from "@/components/main/adaptive/feature/EVD/ShareButton";
import AddToCalendar from "@/components/main/adaptive/feature/EVD/AddToCalendar";
import { fetchEventDetail } from "@/api/main/articles";
import { useDeviceStore } from "@/stores/deviceStore";

const EVDPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useDeviceStore((state) => state.isMobile);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetailAsync = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await fetchEventDetail(id);
        setEvent(eventData);
      } catch (err) {
        console.error("행사 상세 불러오기 실패:", err);
        setError("행사 상세를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetailAsync();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center">로딩중...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center">
        행사를 찾을 수 없습니다.
      </div>
    );
  }

  // 북마크 토글 시 페이지 상태 동기화
  const handleBookmarkToggle = (isBookmarked) => {
    setEvent((prev) => ({
      ...prev,
      is_bookmarked: isBookmarked,
      bookmark_count: isBookmarked ? prev.bookmark_count + 1 : prev.bookmark_count - 1,
    }));
  };

  // 캘린더 더보기 버튼에 필요한 이벤트 데이터
  const eventData = {
    title: event.title,
    content: event.content,
    start_date: event.start_date,
    due_date: event.due_date,
    vendors: { vendor_name: event.vendors?.[0]?.vendor_name || "" },
  };

  // 모바일: 커스텀 헤더 + 고정 하단 북마크 바
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* 고정 상단 헤더 */}
        <header className="fixed top-0 left-0 right-0 z-20 h-[52px] flex items-center justify-between px-4 bg-white">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <ShareButton title={event.title} />
            <AddToCalendar event={eventData} />
          </div>
        </header>

        {/* 스크롤 가능한 본문 영역 */}
        <div className="flex-1 pt-[52px] overflow-y-auto">
          <EventDetail
            isMobile={true}
            articleId={event.article_id}
            status={event.status}
            title={event.title}
            vendors={event.vendors}
            startDate={event.start_date}
            dueDate={event.due_date}
            created_at={event.created_at}
            content={event.content}
            category_name={event.categories?.category_name}
            is_bookmarked={event.is_bookmarked}
            bookmark_count={event.bookmark_count}
            attachments={event.attachments}
          />
        </div>

        {/* 화면 우하단 고정 북마크 버튼 */}
        <div className="fixed bottom-8 right-5 z-50">
          <BookmarkButton articleId={event.article_id} isBookmarked={event.is_bookmarked} onToggle={handleBookmarkToggle} />
        </div>
      </div>
    );
  }

  // 데스크톱: 기존 레이아웃 유지
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TabBar />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-4">
        <EventDetail
          isMobile={false}
          articleId={event.article_id}
          status={event.status}
          title={event.title}
          vendors={event.vendors}
          startDate={event.start_date}
          dueDate={event.due_date}
          created_at={event.created_at}
          content={event.content}
          category_name={event.categories?.category_name}
          is_bookmarked={event.is_bookmarked}
          bookmark_count={event.bookmark_count}
          attachments={event.attachments}
        />
      </div>

      {/* 화면 우하단 고정 북마크 버튼 */}
      <div className="fixed bottom-8 right-6 z-50">
        <BookmarkButton articleId={event.article_id} isBookmarked={event.is_bookmarked} onToggle={handleBookmarkToggle} />
      </div>

      <Footer />
    </div>
  );
};

export default EVDPage;