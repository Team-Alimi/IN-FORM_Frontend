import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, readAllNotifications } from "../../../api/notifications";
import { useDeviceStore } from "../../../stores/deviceStore";
import BottomSheet from "../../mobile/common/BottomSheet";

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

            // html { scrollbar-gutter: stable } 설정과 시너지를 내어
            // 모달 오픈 시에도 스크롤바 가시성을 유지하며 레이아웃 시프트를 완벽 차단합니다.
            document.body.style.overflowY = hasScrollbar ? "scroll" : "hidden";
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflowY = "";

            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        }
        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflowY = "";
        };
    }, [isOpen]);

    // 알림 목록 조회
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
        enabled: isOpen, // 모달이 열릴 때만 페칭
    });

    // 전체 읽음 처리 mutation
    const readAllMutation = useMutation({
        mutationFn: readAllNotifications,
        onSuccess: () => {
            // 목록과 안 읽은 개수 쿼리 모두 무효화하여 최신화
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
        },
    });

    const handleReadAll = (e) => {
        e.stopPropagation();
        readAllMutation.mutate();
    };

    const handleItemClick = (articleId, articleType) => {
        onClose();
        if (articleType === "CLUB") {
            navigate(`/clubs/detail/${articleId}`);
        } else {
            navigate(`/events/detail/${articleId}`);
        }
    };

    const ModalContent = (
        <div className="flex flex-col h-full max-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-gray-900">알림</h2>
                {notifications.length > 0 && (
                    <button
                        onClick={handleReadAll}
                        className="text-sm font-medium text-primary hover:underline cursor-pointer"
                    >
                        모두 읽음
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">알림을 불러오는 중입니다...</p>
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
                    <div className="flex flex-col gap-3 pb-2">
                        {notifications.map((item) => (
                            <div
                                key={item.notification_id}
                                onClick={() => handleItemClick(item.article_id, item.article_type)}
                                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer 
                  ${item.is_read
                                        ? "bg-white border-gray-100 opacity-70"
                                        : "bg-blue-50/30 border-blue-100 hover:bg-white hover:border-primary shadow-sm hover:shadow-md"
                                    }`}
                            >
                                {!item.is_read && (
                                    <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}
                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[13px] font-bold text-primary">{item.title}</span>
                                        <span className="text-[11px] text-gray-400">{item.created_at}</span>
                                    </div>
                                    <p className="text-[14px] text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (!isOpen) return null;

    // 모바일: 바텀시트 활용
    if (isMobile) {
        return (
            <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[70vh]">
                <div className="pb-4">
                    {ModalContent}
                </div>
            </BottomSheet>
        );
    }

    // 데스크톱: 우측 상단 드롭다운 모달
    return (
        <>
            {/* Backdrop for closing - fixed to cover entire screen */}
            <div className="fixed inset-0 z-[100]" onClick={onClose} />

            <div
                className="absolute top-[60px] right-[-140px] w-[380px] bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[101] p-6 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {ModalContent}
            </div>
        </>
    );
};

export default NotificationModal;
