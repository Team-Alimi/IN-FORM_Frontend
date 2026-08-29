import { useDeviceStore } from "@/stores/deviceStore";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import MobileFooter from "@/components/main/mobile/common/MobileFooter";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";
import MobileBookmarkList from "@/components/main/adaptive/feature/BKM/MobileBookmarkList";
import BookmarkSection from "@/components/main/adaptive/feature/MYP/BookmarkSection";

const BKMPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <main className="flex-1 w-full">
                    <MobileBookmarkList />
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
