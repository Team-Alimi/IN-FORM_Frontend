import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../../stores/useAuthStore";
import { fetchUnreadCount } from "../../../api/notifications";
import bellIcon from "../../../assets/icons/notification.svg";
import userIcon from "../../../assets/icons/user.svg";
import NotificationModal from "../../adaptive/common/NotificationModal";

const TabBar = () => {
  const navigate = useNavigate();
  const { isLogIn, userInfo } = useAuthStore();
  const userName = userInfo?.name || "게스트";

  // 알림 모달 상태 관리
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 안 읽은 알림 개수 조회
  const { data: unreadData } = useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: fetchUnreadCount,
    enabled: isLogIn, // 로그인한 경우에만 조회
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
  const unreadCount = unreadData?.unread_count || 0;

  const tabs = [
    { id: "home", label: "홈", to: "/" },
    { id: "board", label: "공지사항", to: "/events" },
    { id: "club", label: "동아리", to: "/clubs" },
  ];

  const handleProfileClick = () => {
    if (isLogIn) {
      navigate("/mypage");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
    {/* 헤더 고정 */}
    <div className="py-10" />
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9fa]">
      <nav className="w-full py-4 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-20">
            {tabs.map((tab) => (
              <NavLink key={tab.id} to={tab.to}>
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center pt-2 pb-0 transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
                  >
                    <span
                      className={`text-xl font-bold transition-colors ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`mt-1 h-0.5 w-12 rounded-full transition-all duration-300 ${isActive
                        ? "bg-primary scale-x-100"
                        : "bg-gray-200 scale-x-0 group-hover:scale-x-75"
                        }`}
                    />
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* 우측 알림 및 프로필 버튼 영역 */}
          <div className="flex items-center gap-4">
            {/* 알림 버튼 및 모달 컨테이너 - 로그인 시에만 표시 */}
            {isLogIn && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer group
                    ${isNotificationOpen
                      ? "bg-white border-2 border-primary shadow-md -translate-y-0.5"
                      : "bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-primary hover:-translate-y-0.5"
                    }`}
                >
                  <img
                    src={bellIcon}
                    alt="알림"
                    className={`w-5 h-5 transition-all
                      ${isNotificationOpen ? "opacity-100 scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"}
                    `}
                  />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white animate-in zoom-in duration-300">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </button>

                {/* 알림 모달 (데스크톱 드롭다운 - 버튼 상대로 위치 고정) */}
                <NotificationModal
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
            )}

            {/* 프로필/로그인 버튼 */}
            <button
              onClick={handleProfileClick}
              className="flex items-center h-11 px-6 rounded-2xl bg-[#0056B3] shadow-sm hover:shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <img
                src={userIcon}
                alt="프로필"
                className="w-5 h-5 mr-2 brightness-0 invert opacity-90 group-hover:opacity-100 transition-all"
              />
              <span className="font-bold text-base text-white transition-colors">
                {isLogIn ? userName : "로그인"}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </div>
    </>
  );
};

export default TabBar;
