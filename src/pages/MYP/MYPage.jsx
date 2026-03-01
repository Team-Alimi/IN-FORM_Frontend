import React, { useState } from "react";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import ProfileSection from "../../components/adaptive/feature/MYP/ProfileSection";
import BookmarkSection from "../../components/adaptive/feature/MYP/BookmarkSection";
import { useDeviceStore } from "../../stores/deviceStore";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";
import MobileFooter from "../../components/mobile/common/MobileFooter";
import DepartmentEditSheet from "../../components/adaptive/feature/MYP/DepartmentEditSheet";
import DepartmentEditModal from "../../components/adaptive/feature/MYP/DepartmentEditModal";
import AccountDeleteSheet from "../../components/adaptive/feature/MYP/AccountDeleteSheet";
import AccountDeleteModal from "../../components/adaptive/feature/MYP/AccountDeleteModal";

const MYPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECF0FF] to-[#F0FDFA]">
                <MobileHeader />
                <main className="flex-1 w-full px-4 py-6">
                    <ProfileSection
                        onEditMajor={() => setIsEditOpen(true)}
                        onDeleteAccount={() => setIsDeleteOpen(true)}
                    />
                    <BookmarkSection />
                </main>
                <MobileFooter />
                <MobileTabBar activeIndex={3} />

                <DepartmentEditSheet
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                />
                <AccountDeleteSheet
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <TabBar />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                <ProfileSection
                    onEditMajor={() => setIsEditOpen(true)}
                    onDeleteAccount={() => setIsDeleteOpen(true)}
                />
                <BookmarkSection />
            </main>

            <Footer />

            <DepartmentEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
            <AccountDeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
            />
        </div>
    );
};

export default MYPage;
