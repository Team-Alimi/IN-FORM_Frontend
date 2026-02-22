import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../../stores/useAuthStore';

const LogoutButton = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("정말 로그아웃 하시겠습니까?")) {
            logout();
            // 로그아웃 처리 후 로그인 페이지로 강제 이동 및 히스토리 덮어쓰기
            navigate('/login', { replace: true });
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full bg-white border border-gray-100 rounded-[18px] py-[18px] md:py-[22px] flex items-center justify-center gap-2.5 text-[#d32f2f] font-extrabold hover:bg-red-50/50 hover:border-red-100 transition-all shadow-[0_2px_15px_rgb(0,0,0,0.03)] text-[15px] md:text-[16px] mb-8"
        >
            <svg
                className="w-5 h-5 md:w-6 md:h-6 text-[#d32f2f]/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            로그아웃
        </button>
    );
};

export default LogoutButton;
