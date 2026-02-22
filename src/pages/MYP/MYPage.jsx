import React from "react";
import TabBar from "../../components/desktop/common/TabBar"; // 임시 최상단 컴포넌트
import Footer from "../../components/desktop/common/Footer";
import ProfileSection from "../../components/adaptive/feature/MYP/ProfileSection";
import BookmarkSection from "../../components/adaptive/feature/MYP/BookmarkSection";
import LogoutButton from "../../components/adaptive/feature/MYP/LogoutButton";

const MYPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <TabBar />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                <ProfileSection />
                <BookmarkSection />
                <LogoutButton />
            </main>

            <Footer />
        </div>
    );
};

export default MYPage;
