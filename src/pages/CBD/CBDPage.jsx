import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import ClubDetail from "../../components/adaptive/feature/CBD/ClubDetail";
//import CBLMockData from "../../mocks/CBL/ClubRowMock.json"
//import CBDMockData from "../../mocks/CBD/ClubDetailMock.json";
import api from "../../api/axios";

const CBDPage = () => {
  // URL 파라미터에서 id값 가져오기
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/v1/club_articles/${id}`);
        console.log("event detail:", res.data);

        setClub(res.data);
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

  if (!club) {
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
        <ClubDetail
          title={club.title}
          vendor={club.vendors.vendor_name}
          startDate={club.start_date}
          dueDate={club.due_date}
          created_at={club.created_at}
          content={club.content}
          linkUrl={club.original_url}
          attachmentUrls={club.attachment_urls}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CBDPage;
