import React, { useState } from "react";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import ProfileSection from "../../components/adaptive/feature/MYP/ProfileSection";
import BookmarkSection from "../../components/adaptive/feature/MYP/BookmarkSection";
import { useDeviceStore } from "../../stores/deviceStore";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";
import DepartmentEditModal from "../../components/adaptive/feature/MYP/DepartmentEditModal";

const MYPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECF0FF] to-[#F0FDFA] pb-20">
                <MobileHeader />
                <main className="flex-1 w-full px-4 py-6">
                    <ProfileSection onEditMajor={() => setIsEditModalOpen(true)} />
                    <BookmarkSection />
                </main>
                <MobileTabBar activeIndex={3} />

                <DepartmentEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />
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
