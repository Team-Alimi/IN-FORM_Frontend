import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "@/stores/deviceStore";
import MobileHeader from "@/components/main/mobile/common/MobileHeader";
import MobileFooter from "@/components/main/mobile/common/MobileFooter";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";
import BookmarkSection from "@/components/main/adaptive/feature/MYP/BookmarkSection";

const BKMPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const navigate = useNavigate();

    // 데스크톱 접근 시 마이페이지로 리다이렉트 (모바일 전용 페이지)
    useEffect(() => {
        if (!isMobile) navigate("/mypage", { replace: true });
    }, [isMobile, navigate]);

    if (!isMobile) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECF0FF] to-[#F0FDFA]">
            <MobileHeader title="북마크" />
            <main className="flex-1 w-full px-4 py-2">
                <BookmarkSection standalone />
            </main>
            <MobileFooter />
            <MobileTabBar activeIndex={3} />
        </div>
    );
};

export default BKMPage;
