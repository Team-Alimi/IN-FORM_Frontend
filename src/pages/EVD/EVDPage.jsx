import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import EventDetail from "../../components/adaptive/feature/EVD/EventDetail";
import { fetchEventDetail } from "../../api/getEventDetail";

const EVDPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      <TabBar />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <EventDetail
          articleId={event.article_id}
          title={event.title}
          vendors={event.vendors}
          startDate={event.start_date}
          dueDate={event.due_date}
          created_at={event.created_at}
          content={event.content}
          category_name={event.categories?.category_name}
          is_bookmarked={event.is_bookmarked}
          bookmark_count={event.bookmark_count}
        />
      </div>
      <Footer />
    </div>
  );
};

export default EVDPage;
