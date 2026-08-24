import { useDeviceStore } from "@/stores/deviceStore";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import MobileHeader from "@/components/main/mobile/common/MobileHeader";
import MobileFooter from "@/components/main/mobile/common/MobileFooter";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";
import BookmarkSection from "@/components/main/adaptive/feature/MYP/BookmarkSection";

const BKMPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA]">
                <MobileHeader title="북마크" />
                <main className="flex-1 w-full px-4 py-2">
                    <BookmarkSection standalone />
                </main>
                <MobileFooter />
                <MobileTabBar activeIndex={3} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <TabBar />
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
                <BookmarkSection />
            </main>
            <Footer />
        </div>
    );
};

export default BKMPage;
