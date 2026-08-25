import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { fetchUnreadCount } from "@/api/main/notifications";
import bellIcon from "@/assets/icons/notification.svg";
import NotificationModal from "@/components/main/adaptive/common/NotificationModal";

// title: 페이지 제목 (예: "공지사항") — 일반 페이지용
// greeting: true면 "안녕하세요, {name}님!" 표시 — 홈 페이지용
// subtitle: 제목/인사말 아래 작은 보조 텍스트 (선택)
const MobileHeader = ({ title, greeting = false, subtitle }) => {
  const isLogIn = useAuthStore((state) => state.isLogIn);
  const userName = useAuthStore((state) => state.userInfo?.name) || "게스트";
  const navigate = useNavigate();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 안 읽은 알림 개수 조회 (로그인 시에만)
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

  const leftText = greeting ? `안녕하세요, ${userName}님!` : title;

  return (
    <>
      {/* 헤더 높이만큼 여백 확보 */}
      <div className={subtitle ? "h-[76px]" : "h-16"} />
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          {/* 좌측: 타이틀 또는 인사말 */}
          <div className="flex flex-col">
            <span className="text-[22px] font-bold text-gray-900 leading-tight">
              {leftText}
            </span>
            {subtitle && (
              <span className="text-[14px] text-gray-400 mt-0.5">{subtitle}</span>
            )}
          </div>

          {/* 우측: 알림 벨 버튼 */}
          <button
            onClick={handleBellClick}
            className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
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

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};

export default MobileHeader;
