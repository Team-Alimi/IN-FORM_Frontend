import React, { useState } from "react";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import ProfileSection from "../../components/adaptive/feature/MYP/ProfileSection";
import BookmarkSection from "../../components/adaptive/feature/MYP/BookmarkSection";
import { useDeviceStore } from "../../stores/deviceStore";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";
import DepartmentEditModal from "../../components/adaptive/feature/MYP/DepartmentEditModal";
import BottomSheet from "../../components/mobile/common/BottomSheet";

const MYPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECF0FF] to-[#F0FDFA] pb-20">
                <MobileHeader />
                <main className="flex-1 w-full px-4 py-6">
                    <ProfileSection onEditMajor={() => setIsEditModalOpen(true)} />
                    <button
                        onClick={() => setIsBottomSheetOpen(true)}
                        className="mt-4 w-full py-3 bg-[#294D7C] text-white rounded-xl font-medium shadow-sm active:scale-95 transition-transform"
                    >
                        바텀시트 테스트 열기
                    </button>
                    <BookmarkSection />
                </main>
                <MobileTabBar activeIndex={3} />

                <DepartmentEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />

                <BottomSheet
                    isOpen={isBottomSheetOpen}
                    onClose={() => setIsBottomSheetOpen(false)}
                >
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-[#15171A] mb-2">바텀시트 테스트</h2>
                        <p className="text-[#727272] mb-6">색깔: #F4F4F4</p>
                        <button
                            onClick={() => setIsBottomSheetOpen(false)}
                            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
                        >
                            닫기
                        </button>
                    </div>
                </BottomSheet>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <TabBar />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                <ProfileSection onEditMajor={() => setIsEditModalOpen(true)} />
                <BookmarkSection />
            </main>

            <Footer />

            <DepartmentEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
};

export default MYPage;
