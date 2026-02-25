import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../../../stores/useAuthStore";
import { getVendors } from "../../../../api/getVendors";
import { useDeviceStore } from "../../../../stores/deviceStore";

const ProfileSection = ({ onEditMajor }) => {
    const { userInfo, logout } = useAuthStore();
    const queryClient = useQueryClient();
    const isMobile = useDeviceStore((state) => state.isMobile);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            logout();
            queryClient.clear(); // 전역 캐시 초기화
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className={`
            ${isMobile
                ? "bg-[#F4F8FE] rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E8F0FB]"
                : "bg-white rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100"
            }
            flex flex-col mb-8 w-full transition-all relative overflow-visible
        `}>
            {/* Background decoration with its own clipping (Mobile only) */}
            {isMobile && (
                <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>
            )}

            {/* Kebab Menu (Top Right) - Only for Logged in users */}
            {userInfo && (
                <div className="absolute top-4 right-4" ref={menuRef}>
                    <button
                        onClick={toggleMenu}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="더보기"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="7" r="1.5" fill="#9CA3AF" />
                            <circle cx="12" cy="12" r="1.5" fill="#9CA3AF" />
                            <circle cx="12" cy="17" r="1.5" fill="#9CA3AF" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                            <button
                                onClick={() => { onEditMajor?.(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                학과 수정
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50 flex items-center gap-2"
                            >
                                <span>로그아웃</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4">
                {/* Simple Profile Image Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-gray-300 border border-[#E8F0FB] shadow-sm shrink-0 overflow-hidden relative">
                    <svg
                        className="w-10 h-10 md:w-12 md:h-12 mt-2"
                        fill="currentColor"
                        viewBox="0 2.5 24 24"
                    >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>

                {/* User Info */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[18px] md:text-2xl font-extrabold text-gray-900 truncate">
                            {userInfo ? userInfo.name : "익명의 뷰어"}
                        </h2>
                    </div>
                    <p className="text-gray-400 text-[13px] md:text-sm mt-0.5 truncate font-medium">
                        {userInfo ? userInfo.email : "address@inha.edu"}
                    </p>
                    {userInfo && (
                        <div className="mt-1 flex items-center">
                            <span className="text-xs md:text-sm text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                                {userInfo?.major?.vendor_name || "학과 미설정"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;
