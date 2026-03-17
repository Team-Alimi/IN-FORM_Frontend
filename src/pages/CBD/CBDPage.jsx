import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "@/components/desktop/common/TabBar";
import Footer from "@/components/desktop/common/Footer";
import MobileHeader from "@/components/mobile/common/mobileHeader";
import MobileTabBar from "@/components/mobile/common/mobileTabBar";
import MobileFooter from "@/components/mobile/common/MobileFooter";
import ClubDetail from "@/components/adaptive/feature/CBD/ClubDetail";
import { fetchClubDetail } from "@/api/clubArticles";
import { useDeviceStore } from "@/stores/deviceStore";

const CBDPage = () => {
  const { id } = useParams();
  const isMobile = useDeviceStore((state) => state.isMobile);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClubDetail(id);
        setClub(data);
      } catch (err) {
        console.error("동아리 공지 상세 불러오기 실패:", err);
        setError("상세 내용을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDetail();
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
        동아리를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className={isMobile ? "min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA]" : "min-h-screen flex flex-col bg-gray-50"}>
      {isMobile ? <MobileHeader /> : <TabBar />}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 max-mobile:py-2">
        <ClubDetail
          title={club.title}
          vendors={club.vendors}
          startDate={club.start_date}
          dueDate={club.due_date}
          created_at={club.created_at}
          content={club.content}
          linkUrl={club.original_url}
          attachments={club.attachments}
        />
      </div>
      {isMobile ? (
        <>
          <MobileFooter />
          <MobileTabBar activeIndex={2} />
        </>
      ) : <Footer />}
    </div>
  );
};

export default CBDPage;
