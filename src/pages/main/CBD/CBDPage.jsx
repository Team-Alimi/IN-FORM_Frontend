import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import ClubDetail from "@/components/main/adaptive/feature/CBD/ClubDetail";
import BookmarkButton from "@/components/main/adaptive/feature/EVD/BookmarkButton";
import { fetchClubDetail } from "@/api/main/articles";
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

  // 북마크 토글 시 페이지 상태 동기화
  const handleBookmarkToggle = (isBookmarked) => {
    setClub((prev) => ({
      ...prev,
      is_bookmarked: isBookmarked,
      bookmark_count: isBookmarked ? prev.bookmark_count + 1 : prev.bookmark_count - 1,
    }));
  };

  const applyUrl = club.vendors?.[0]?.source_url ?? null;

  // 모바일: 커스텀 레이아웃 + 고정 북마크 버튼
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto">
          <ClubDetail
            isMobile={true}
            title={club.title}
            status={club.deadline_status}
            vendors={club.vendors}
            categories={club.categories}
            startDate={club.starts_on}
            dueDate={club.ends_on}
            created_at={club.published_at}
            summary={club.summary}
            bookmark_count={club.bookmark_count}
            view_count={club.view_count}
            content={club.content}
            linkUrl={applyUrl}
            attachments={club.attachments}
          />
        </div>

        {/* 하단 고정 바: 북마크 + 지원하러 가기 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          <BookmarkButton
            articleId={club.id}
            articleType="CLUB"
            isBookmarked={club.is_bookmarked}
            onToggle={handleBookmarkToggle}
          />
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl font-medium text-sm bg-primary text-white"
            >
              지원하러 가기
            </a>
          )}
        </div>
      </div>
    );
  }

  // 데스크톱: 기존 레이아웃 유지
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TabBar />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-4">
        <ClubDetail
          isMobile={false}
          title={club.title}
          status={club.deadline_status}
          vendors={club.vendors}
          categories={club.categories}
          startDate={club.starts_on}
          dueDate={club.ends_on}
          created_at={club.published_at}
          summary={club.summary}
          bookmark_count={club.bookmark_count}
          view_count={club.view_count}
          content={club.content}
          linkUrl={applyUrl}
          attachments={club.attachments}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CBDPage;
