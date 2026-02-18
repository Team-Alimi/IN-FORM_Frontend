import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import EventDetail from "../../components/adaptive/feature/EVD/EventDetail";
import api from "../../api/axios";

const EVDPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/v1/school_articles/${id}`);
        console.log("event detail:", res.data);

        setEvent(res.data);
      } catch (err) {
        console.error("행사 상세 불러오기 실패:", err);
        setError("행사 상세를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetail();
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
          title={event.title}
          vendor={event.vendors.vendor_name}
          startDate={event.start_date}
          dueDate={event.due_date}
          created_at={event.created_at}
          content={event.content}
          linkUrl={event.original_url}
        />
      </div>
      <Footer />
    </div>
  );
};

export default EVDPage;
