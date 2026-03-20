import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { fetchUnreadCount } from "@/api/notifications";
import logoIcon from "@/assets/icons/logo.svg";
import bellIcon from "@/assets/icons/notification.svg";
import userIcon from "@/assets/icons/user.svg";
import NotificationModal from "@/components/main/adaptive/common/NotificationModal";

export default function MobileHeader() {
	const isLogIn = useAuthStore((state) => state.isLogIn);
	const userName = useAuthStore((state) => state.userInfo?.name) || "게스트";
	const navigate = useNavigate();
	const handleLogoClick = () => navigate("/");

	// 알림 모달 상태 관리
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);

	// 안 읽은 알림 개수 조회
	const { data: unreadData } = useQuery({
		queryKey: ["notificationsUnreadCount"],
		queryFn: fetchUnreadCount,
		enabled: isLogIn, // 로그인한 경우에만 조회
		refetchInterval: 60 * 1000,
	});
	const unreadCount = unreadData?.unread_count || 0;

	return (
		<>
		{/* 헤더 고정 */}
		<div className="h-[52px]" />
		<header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-2 py-1.5 bg-[#ECF0FF]">
			<div className="flex items-center mt-1">
				<img src={logoIcon} alt="INFORM Logo" className="h-6 mr-1 ml-2" />
				<span
					className="text-lg font-bold tracking-tight text-black cursor-pointer ml-1"
					onClick={handleLogoClick}
				>
					IN:FORM
				</span>
			</div>
			<div className="flex items-center gap-2 mt-1">
				{isLogIn && (
					<button
						onClick={() => setIsNotificationOpen(true)}
						className="relative w-9 h-9 flex items-center justify-center rounded-full border border-[#CDCDCD] bg-[#ECF0FF] cursor-pointer"
					>
						<img src={bellIcon} alt="알림" className="w-4 h-4" />
						{unreadCount > 0 && (
							<div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-[#ECF0FF]">
								{unreadCount > 99 ? "99+" : unreadCount}
							</div>
						)}
					</button>
				)}
				<button
					className="flex items-center h-9 px-2.5 rounded-full border border-[#CDCDCD] bg-[#ECF0FF] cursor-pointer"
					onClick={() => navigate("/mypage")}
				>
					<img src={userIcon} alt="프로필" className="w-4 h-4 mr-1" />
					<span className="font-medium text-sm">{userName}</span>
				</button>
			</div>

			{/* 알림 모달 (모바일 바텀시트) */}
			<NotificationModal
				isOpen={isNotificationOpen}
				onClose={() => setIsNotificationOpen(false)}
			/>
		</header>
		</>
	);
}