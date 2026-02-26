import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "../../stores/deviceStore";
import bellIcon from "../../assets/icons/notification.svg";
import calendarLogo from "../../assets/icons/calendarLogo.png";

/**
 * Onboarding Page Component
 * 신규 유저를 위한 서비스 가이드 페이지 (데스크톱 특화 버전)
 */
const ONBPage = () => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);

    // 서비스 시작 핸들러
    const handleStart = () => {
        navigate("/", { replace: true });
    };

    // 데스크톱 스크롤 핸들러 (100vh 섹션 스냅 기준)
    const handleDesktopScroll = (e) => {
        if (isMobile) return;
        const { scrollTop, offsetHeight } = e.currentTarget;
        if (offsetHeight === 0) return;
        const index = Math.round(scrollTop / offsetHeight);
        if (activeSection !== index) {
            setActiveSection(index);
        }
    };

    // --- 모바일 전용 상태 및 데이터 ---
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 5;
    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1);
    };
    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    const mobileSlides = [
        {
            tag: "WELCOME",
            title: <>IN:FORM에 오신 것을<br />환영합니다</>,
            desc: "인하대학교 공지사항을\n가장 스마트하게 확인하는 방법",
            icon: <img src="/inform-logo.png" className="w-20 h-20" />,
            bgColor: "bg-[#f8faff]"
        },
        {
            tag: "CALENDAR",
            title: <>모든 학사일정을<br /><span className="text-primary">한 눈에 쏙</span></>,
            desc: "실제 공지 게시글과 연동되어\n내 스케줄을 스마트하게 관리하세요",
            icon: <img src="/assets/onboarding/Mobile_Calendar.jpg" className="w-full h-full object-contain rounded-2xl shadow-md" />,
            bgColor: "bg-[#f8faff]"
        },
        {
            tag: "BOOKMARK",
            title: <>나중에 볼 공지는<br /><span className="text-primary">핀으로 고정!</span></>,
            desc: "장학금, 대회 정보 등\n중요한 소식은 보관함에 담아두세요",
            icon: <img src="/assets/onboarding/Mobile_Bookmark.jpg" className="w-full h-full object-contain rounded-2xl shadow-md" />,
            bgColor: "bg-[#f8faff]"
        },
        {
            tag: "CLUBS & EVENTS",
            title: <>동아리에서 진행하는<br /><span className="text-primary">행사들을 확인해보세요!</span></>,
            desc: "다채로운 동아리 활동 소식과\n다양한 이벤트 정보를 한 곳에 모았습니다",
            icon: <img src="/assets/onboarding/Mobile_Club.jpg" className="w-full h-full object-contain rounded-2xl shadow-md" />,
            bgColor: "bg-[#f8faff]"
        },
        {
            tag: "",
            title: <>더 똑똑해진<br />학교 생활의 시작</>,
            desc: "지금 바로 IN:FORM과 함께\n효율적인 캠퍼스 라이프를 즐기세요",
            icon: <img
                src="/inform-logo.png"
                className={`w-28 h-auto transition-all duration-1000 delay-300 ${currentSlide === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            />,
            bgColor: "bg-gray-900",
            isLast: true
        }
    ];

    // --- 렌더링 로직 ---
    if (isMobile) {
        return (
            <div className={`w-full h-[100dvh] transition-colors duration-500 overflow-hidden flex flex-col ${mobileSlides[currentSlide].bgColor}`}>
                {/* Progress Indicators */}
                <div className="flex gap-1.5 justify-center pt-12 px-10">
                    {[...Array(totalSlides)].map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? "flex-[2] bg-primary" : "flex-1 bg-gray-200"}`} />
                    ))}
                </div>

                {/* Slides Container */}
                <div className="flex-1 relative overflow-hidden">
                    {mobileSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-all duration-500 ease-out
                                ${index === currentSlide ? "opacity-100 translate-x-0" : index < currentSlide ? "opacity-0 -translate-x-full" : "opacity-0 translate-x-full"}`}
                        >
                            <div className="mb-10 w-48 h-48 bg-white/50 rounded-[40px] flex items-center justify-center shadow-inner">
                                {slide.icon}
                            </div>

                            <div className="flex flex-col items-center">
                                <span className={`text-[11px] font-black tracking-[0.2em] mb-4 
                                    ${slide.isLast ? "text-blue-400" : "text-primary/60"}`}>
                                    {slide.tag}
                                </span>
                                <h1 className={`text-[28px] font-black leading-tight mb-4 tracking-tight 
                                    ${slide.isLast ? "text-white" : "text-gray-900"}`}>
                                    {slide.title}
                                </h1>
                                <p className={`text-[15px] font-medium leading-relaxed whitespace-pre-line text-center
                                    ${slide.isLast ? "text-gray-400" : "text-gray-500"}`}>
                                    {slide.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="px-6 pb-12 flex flex-col gap-3">
                    {currentSlide === totalSlides - 1 ? (
                        <button
                            onClick={handleStart}
                            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                        >
                            IN:FORM 시작하기
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            {currentSlide > 0 && (
                                <button
                                    onClick={prevSlide}
                                    className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-2xl active:scale-95 transition-all"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={nextSlide}
                                className="flex-1 py-5 bg-white border border-gray-100 text-gray-900 rounded-[24px] font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                다음으로
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {currentSlide < totalSlides - 1 && (
                        <button onClick={handleStart} className="text-[13px] font-bold text-gray-400 py-2 hover:text-gray-500">
                            건너뛰기
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 데스크톱 뷰
    return (
        <div
            className="w-full h-screen overflow-y-auto snap-y snap-mandatory bg-[#f8faff] scroll-smooth"
            ref={containerRef}
            onScroll={handleDesktopScroll}
        >
            {/* 1. Welcome Section */}
            <section data-index="0" className="w-full h-screen snap-start flex flex-col items-center justify-center relative overflow-hidden bg-[#f8faff]">
                <div className={`transition-all duration-1000 transform ${activeSection === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center mb-10 mx-auto">
                        <img src="/inform-logo.png" alt="InForm" className="w-16 h-auto" />
                    </div>
                    <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight text-center leading-tight">
                        인하대학교 공지사항 큐레이션<br />
                        <span className="text-primary mt-2 block italic">IN:FORM에 오신 것을 환영합니다</span>
                    </h1>
                    <p className="text-2xl text-gray-500 font-medium text-center max-w-3xl leading-relaxed mx-auto">
                        나에게 꼭 필요한 소식을 이곳에 한번에 찾아보세요.
                    </p>
                </div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-gray-400 animate-bounce">
                    <span className="text-[11px] font-black tracking-[0.3em] uppercase opacity-60">Scroll Down</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>
            </section>

            {/* 2. Calendar Section */}
            <section data-index="1" className="w-full h-screen snap-start flex items-center justify-center px-32 gap-32 bg-[#f8faff]">
                <div className={`flex-[1.2] flex justify-center transition-all duration-1000 ${activeSection === 1 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-95"}`}>
                    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden relative">
                        <img src="/assets/onboarding/Desktop_Calendar.jpg" alt="Calendar Guide" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[40px]"></div>
                    </div>
                </div>
                <div className={`flex-1 transition-all duration-1000 delay-300 ${activeSection === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-primary rounded-2xl text-xs font-black tracking-widest mb-8 uppercase">
                        Smart Scheduler
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
                        학사일정을<br />
                        <span className="text-primary">한 눈에 완벽하게</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        실제 공지 게시글과 연동되어<br />
                        클릭 한 번으로 상세 내용까지 바로 확인할 수 있습니다.
                    </p>
                </div>
            </section>

            {/* 3. Bookmark Section */}
            <section data-index="2" className="w-full h-screen snap-start flex items-center justify-center px-32 gap-32 bg-[#f8faff]">
                <div className={`flex-1 transition-all duration-1000 ${activeSection === 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-2xl text-xs font-black tracking-widest mb-8 uppercase">
                        Personal Archive
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
                        중요한 공지는 핀으로!<br />
                        <span className="text-primary">북마크 기능</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        장학금, 대회 정보 등 나중에 다시 봐야 할 소식은<br />
                        북마크 버튼으로 콕 짚어두세요.<br />
                        마이페이지에서 언제든 확인할 수 있습니다.
                    </p>
                </div>
                <div className={`flex-[1.2] flex justify-center transition-all duration-1000 delay-300 ${activeSection === 2 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-95"}`}>
                    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden relative">
                        <img src="/assets/onboarding/Desktop_Bookmark.jpg" alt="Bookmark Guide" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[40px]"></div>
                    </div>
                </div>
            </section>

            {/* 4. Club Section */}
            <section data-index="3" className="w-full h-screen snap-start flex items-center justify-center px-32 gap-32 bg-[#f8faff]">
                <div className={`flex-[1.2] flex justify-center transition-all duration-1000 ${activeSection === 3 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-95"}`}>
                    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden relative">
                        <img src="/assets/onboarding/Desktop_club.jpg" alt="Club Guide" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[40px]"></div>
                    </div>
                </div>
                <div className={`flex-1 transition-all duration-1000 delay-300 ${activeSection === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black tracking-widest mb-8 uppercase">
                        Clubs & Events
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
                        다양한 동아리 활동,<br />
                        <span className="text-primary">직접 확인해보세요!</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        다양한 동아리 행사와 소식들을<br />
                        이제 IN:FORM에서 한 눈에 모아보세요.
                    </p>
                </div>
            </section>

            {/* 5. Start Section */}
            <section data-index="4" className="w-full h-screen snap-start flex flex-col items-center justify-center bg-gray-900 text-white p-10 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
                <div className={`relative z-10 transition-all duration-1000 ${activeSection === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
                    <div className="mb-12 flex justify-center">
                        <img
                            src="/inform-logo.png"
                            className={`w-32 h-auto transition-all duration-1000 delay-300 ${activeSection === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                            alt="Logo"
                        />
                    </div>
                    <h2 className="text-6xl font-black mb-10 text-center leading-tight tracking-tight">
                        우리의 캠퍼스 라이프,<br />
                        <span className="text-blue-400">더 쉽게 시작해볼까요?</span>
                    </h2>
                    <p className="text-2xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed font-medium">
                        모든 준비가 끝났습니다.<br />
                        지금 바로 즐거운 인하대학교 생활을 시작해보세요.
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={handleStart}
                            className="group relative px-16 py-6 bg-blue-600 rounded-[28px] text-2xl font-black shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-4"
                        >
                            IN:FORM 시작하기
                            <svg className="w-7 h-7 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-12 text-gray-600 text-xs font-black tracking-[0.4em] uppercase opacity-40">
                    © 2026 Team Alimi. All rights reserved.
                </div>
            </section>
        </div>
    );
};

export default ONBPage;
