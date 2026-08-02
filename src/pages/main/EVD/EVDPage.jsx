import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import MobileHeader from "@/components/main/mobile/common/mobileHeader";
import MobileTabBar from "@/components/main/mobile/common/mobileTabBar";
import MobileFooter from "@/components/main/mobile/common/MobileFooter";
import EventDetail from "@/components/main/adaptive/feature/EVD/EventDetail";
import { fetchEventDetail } from "@/api/articles";
import { useDeviceStore } from "@/stores/deviceStore";

const EVDPage = () => {
  const { id } = useParams();
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

  return (
    <div className={isMobile ? "min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA]" : "min-h-screen flex flex-col bg-gray-50"}>
      {isMobile ? <MobileHeader /> : <TabBar />}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 max-mobile:py-2">
        <EventDetail
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
      {isMobile ? (
        <>
          <MobileFooter />
          <MobileTabBar activeIndex={1} />
        </>
      ) : <Footer />}
    </div>
  );
};

export default EVDPage;
