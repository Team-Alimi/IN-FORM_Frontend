import React, { useState } from "react";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import ProfileSection from "@/components/main/adaptive/feature/MYP/ProfileSection";
import BookmarkSection from "@/components/main/adaptive/feature/MYP/BookmarkSection";
import { useDeviceStore } from "@/stores/deviceStore";
import MobileHeader from "@/components/main/mobile/common/MobileHeader";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";
import MobileFooter from "@/components/main/mobile/common/MobileFooter";
import DepartmentEditSheet from "@/components/main/adaptive/feature/MYP/DepartmentEditSheet";
import DepartmentEditModal from "@/components/main/adaptive/feature/MYP/DepartmentEditModal";
import AccountDeleteSheet from "@/components/main/adaptive/feature/MYP/AccountDeleteSheet";
import AccountDeleteModal from "@/components/main/adaptive/feature/MYP/AccountDeleteModal";

const MYPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECF0FF] to-[#F0FDFA]">
                <MobileHeader />
                <main className="flex-1 w-full px-4 py-2">
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

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
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
