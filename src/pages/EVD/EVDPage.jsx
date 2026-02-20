import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import BackHeader from "../../components/adaptive/common/BackHeader";
import EventDetail from "../../components/adaptive/feature/EVD/EventDetail";
import { useDeviceStore } from "../../stores/deviceStore";
import { fetchEventDetail } from "../../api/getEventDetail";
import OriginalUrlBtn from "../../components/adaptive/feature/EVD/OriginalUrlBtn";

const EVDPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMobile = useDeviceStore((state) => state.isMobile);

  useEffect(() => {
    const fetchEventDetailAsync = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await fetchEventDetail(id);
        console.log("event detail:", eventData);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isMobile ? (
        <BackHeader title="공지사항" />
      ) : (
        <TabBar />
      )}
      <div className={isMobile ? "flex-1 w-full pt-12 px-0 pb-4" : "flex-1 w-full max-w-6xl mx-auto px-4 py-6"}>
        <EventDetail
          title={event.title}
          vendors={event.vendors}
          startDate={event.start_date}
          dueDate={event.due_date}
          created_at={event.created_at}
          content={event.content}
        />
      </div>
      {!isMobile && <Footer />}
    </div>
  );
};

export default EVDPage;
