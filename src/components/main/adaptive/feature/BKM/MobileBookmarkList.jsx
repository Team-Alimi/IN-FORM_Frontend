import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MobileBookmarkItem from "@/components/main/adaptive/feature/BKM/MobileBookmarkItem";
import SearchBar from "@/components/main/adaptive/common/SearchBar";
import { fetchBookmarks, deleteBookmark } from "@/api/main/bookmarks";
import { fetchUnreadCount } from "@/api/main/notifications";
import NotificationModal from "@/components/main/adaptive/common/NotificationModal";
import useAuthStore from "@/stores/useAuthStore";
import bellIcon from "@/assets/icons/notification.svg";

// 소스 필터 탭 정의
const SOURCE_TABS = [
  { label: "전체", value: null },
  { label: "공지사항", value: "SCHOOL" },
  { label: "동아리", value: "CLUB" },
];

const MobileBookmarkList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isLogIn = useAuthStore((state) => state.isLogIn);

  // ─── 필터 / 검색 상태 ─────────────────────────────────────────────────────
  const [sourceFilter, setSourceFilter] = useState(null); // null=전체, "SCHOOL", "CLUB"
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState(""); // Enter 시 쿼리에 반영되는 검색어

  // 검색어를 지웠을 때 쿼리도 초기화
  useEffect(() => {
    if (!searchInput.trim()) setKeyword("");
  }, [searchInput]);

  // ─── 선택 상태 ────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  // 필터/검색어가 바뀌면 선택 초기화
  useEffect(() => {
    setSelectedIds(new Set());
  }, [sourceFilter, keyword]);

  // ─── 알림 ─────────────────────────────────────────────────────────────────
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: fetchUnreadCount,
    enabled: isLogIn,
    refetchInterval: 60 * 1000,
  });
  const unreadCount = unreadData?.unread_count || 0;

  const handleBellClick = () => {
    if (!isLogIn) {
      navigate("/login");
      return;
    }
    setIsNotificationOpen(true);
  };

  // ─── 북마크 목록 조회 ─────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", sourceFilter, keyword],
    queryFn: () =>
      fetchBookmarks({ source_type: sourceFilter, keyword, page: 1, size: 50 }),
    enabled: isLogIn,
  });

  const bookmarks = data?.data?.content || [];

  // ─── 선택 핸들러 ──────────────────────────────────────────────────────────
  const isAllSelected =
    bookmarks.length > 0 && selectedIds.size === bookmarks.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookmarks.map((b) => b.id)));
    }
  };

  const handleToggleItem = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ─── 삭제 ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedIds) {
        await deleteBookmark(id);
      }
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (error) => {
      console.error("북마크 삭제 실패:", error);
    },
  });

  const handleDelete = () => {
    if (selectedIds.size === 0 || deleteMutation.isPending) return;
    deleteMutation.mutate();
  };

  const handleSearchSubmit = (term) => {
    setKeyword(term);
  };

  return (
    <>
      {/* 헤더 높이만큼 여백 */}
      <div className="h-[66px]" />

      {/* 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[22px] font-bold text-gray-900">북마크</span>
          <button
            onClick={handleBellClick}
            className="relative w-10 h-10 flex items-center justify-center"
          >
            <img src={bellIcon} alt="알림" className="w-6 h-6" />
            {isLogIn && unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="flex flex-col pb-24">
        {/* 검색바 */}
        <div className="px-4 pt-1 pb-3">
          <SearchBar
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder="제목으로 검색"
          />
        </div>

        {/* 소스 필터 탭 + 선택 취소 */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SOURCE_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSourceFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  sourceFilter === tab.value
                    ? "bg-[#4068f7] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* 선택된 항목이 있을 때만 표시: 선택 전체 해제 */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[13px] font-medium text-red-500"
            >
              취소
            </button>
          )}
        </div>

        {/* 목록 */}
        {isLogIn ? (
          isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              불러오는 중...
            </div>
          ) : bookmarks.length > 0 ? (
            <>
              {/* 전체 선택 행 */}
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                <button
                  onClick={handleToggleAll}
                  className="flex items-center gap-2 text-[13px] text-gray-600"
                >
                  <div
                    className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                      isAllSelected
                        ? "border-[#4068f7] bg-[#4068f7]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isAllSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  전체 선택
                </button>
                {selectedIds.size > 0 && (
                  <span className="text-[13px] text-[#4068f7] font-medium">
                    {selectedIds.size}개 선택됨
                  </span>
                )}
              </div>

              {/* 북마크 아이템 목록 */}
              <div className="px-4">
                {bookmarks.map((bookmark) => (
                  <MobileBookmarkItem
                    key={bookmark.id}
                    id={bookmark.id}
                    sourceType={bookmark.source_type}
                    title={bookmark.title}
                    categories={bookmark.categories}
                    vendors={bookmark.vendors}
                    endsOn={bookmark.ends_on}
                    deadlineStatus={bookmark.deadline_status}
                    viewCount={bookmark.view_count}
                    isSelected={selectedIds.has(bookmark.id)}
                    onToggleSelect={handleToggleItem}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-bold mb-1">
                {keyword ? "검색 결과가 없습니다" : "북마크한 글이 없습니다"}
              </p>
              <p className="text-gray-400 text-sm">
                {keyword
                  ? "다른 검색어를 입력해보세요"
                  : "공지사항이나 동아리 공고를 북마크해보세요"}
              </p>
            </div>
          )
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <p className="text-gray-900 font-bold text-[18px] mb-2">
              로그인이 필요합니다
            </p>
            <p className="text-gray-400 text-sm mb-8">
              북마크 기능을 사용하려면 로그인이 필요합니다.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#4068f7] text-white font-bold py-3 px-8 rounded-xl"
            >
              로그인하기
            </button>
          </div>
        )}
      </div>

      {/* 하단 고정 삭제 버튼 */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-2">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full py-3.5 rounded-xl font-bold text-[15px] bg-red-500 text-white disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {deleteMutation.isPending
              ? "삭제 중..."
              : `${selectedIds.size}개 삭제하기`}
          </button>
        </div>
      )}

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};

export default MobileBookmarkList;
