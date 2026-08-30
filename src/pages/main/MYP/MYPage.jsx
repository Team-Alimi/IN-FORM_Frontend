import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import MobileMYPage from "@/components/main/adaptive/feature/MYP/MobileMYPage";
import { useDeviceStore } from "@/stores/deviceStore";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";

const MYPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
                <main className="flex-1 w-full">
                    <MobileMYPage />
                </main>
                <MobileTabBar activeIndex={4} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <TabBar />
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col">
                <MobileMYPage />
            </main>
            <Footer />
        </div>
    );
};

export default MYPage;
