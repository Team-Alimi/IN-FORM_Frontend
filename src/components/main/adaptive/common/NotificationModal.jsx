import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoClose } from "react-icons/io5";
import { fetchNotifications, readNotification, readAllNotifications } from "@/api/main/notifications";
import { useDeviceStore } from "@/stores/deviceStore";
import BottomSheet from "@/components/main/mobile/common/BottomSheet";

// 알림 type → 뱃지 레이블·색상 매핑
const TYPE_BADGE = {
  DEADLINE_D1: { label: "D-1 마감", className: "bg-red-100 text-red-500" },
  COMMENT_REPLY: { label: "댓글", className: "bg-blue-100 text-blue-500" },
};
const DEFAULT_BADGE = { label: "알림", className: "bg-gray-100 text-gray-500" };

/**
 * ISO-8601 문자열 → 상대 시간 ("10분 전", "1시간 전", "어제" 등)
 */
const getRelativeTime = (isoString) => {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR");
};

/**
 * NotificationModal Component
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {function} onClose - 모달 닫기 핸들러
 */
const NotificationModal = ({ isOpen, onClose }) => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 스크롤 잠금 처리 (데스크톱/모바일 공통)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const hasScrollbar = document.documentElement.scrollHeight > window.innerHeight;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = hasScrollbar ? "scroll" : "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    };
  }, [isOpen]);

  // 알림 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(1),
    enabled: isOpen,
  });

  const notifications = data?.content ?? [];

  // 개별 읽음 처리
  const readOneMutation = useMutation({
    mutationFn: readNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
    },
  });

  // 전체 읽음 처리
  const readAllMutation = useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
    },
  });

  const handleReadAll = (e) => {
    e.stopPropagation();
    readAllMutation.mutate();
  };

  const handleItemClick = (item) => {
    // 읽지 않은 경우 개별 읽음 처리
    if (!item.read) readOneMutation.mutate(item.id);
    onClose();
    // article_id가 있으면 공지 상세로 이동
    if (item.article_id) {
      navigate(`/events/detail/${item.article_id}`);
    }
  };

  const ModalContent = (
    <div className="flex flex-col h-full max-h-[500px]">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-xl font-bold text-gray-900">알림</h2>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <button
              onClick={handleReadAll}
              className="text-[13px] font-medium text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              모두 읽음
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <IoClose className="text-[20px] text-gray-500" />
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">알림을 불러오는 중입니다...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-1">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-gray-500 font-medium text-[15px]">알림이 없습니다</p>
            <p className="text-gray-400 text-xs">북마크한 공지의 마감 정보를 알려드려요.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((item) => {
              const badge = TYPE_BADGE[item.type] ?? DEFAULT_BADGE;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="relative flex gap-3 px-1 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {/* 안 읽음 표시 점 */}
                  <div className="mt-1.5 shrink-0 w-2">
                    {!item.read && (
                      <span className="block w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </div>

                  {/* 본문 */}
                  <div className="flex-1 min-w-0">
                    {/* 타입 뱃지 */}
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mb-1.5 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {/* 제목 */}
                    <p
                      className={`text-[14px] font-semibold leading-snug mb-1 ${
                        item.read ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </p>
                    {/* 본문 */}
                    <p className="text-[13px] text-gray-500 leading-snug line-clamp-2 mb-1.5">
                      {item.message}
                    </p>
                    {/* 경과 시간 */}
                    <p className="text-[12px] text-gray-400">{getRelativeTime(item.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  // 모바일: 바텀시트
  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[70vh]">
        <div className="pb-4">{ModalContent}</div>
      </BottomSheet>
    );
  }

  // 데스크톱: 우측 상단 드롭다운
  return (
    <>
      <div className="fixed inset-0 z-100" onClick={onClose} />
      <div
        className="absolute top-[60px] right-[-140px] w-[380px] bg-white rounded-4xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-101 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {ModalContent}
      </div>
    </>
  );
};

export default NotificationModal;
