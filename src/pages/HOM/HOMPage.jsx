import Footer from "../../components/desktop/common/Footer";
import TabBar from "../../components/desktop/common/TabBar";
import ServiceLinkList from "../../components/desktop/common/ServiceLinkList";
import CalendarSection from "../../components/adaptive/feature/HOM/CalendarSection";
import HotEventList from "../../components/mobile/feature/HOM/HotEventList";
import { useDeviceStore } from "../../stores/deviceStore";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";
import MobileFooter from "../../components/mobile/common/MobileFooter";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchClubs } from "../../api/clubArticles";
const HOMPage = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["clubs", "", 1], // 1단계에서 정한 key와 동일
      queryFn: async () => {
        const res = await fetchClubs({ page: 1, size: 4 });
        return {
          clubList: res.data.data.club_articles,
          pageInfo: res.data.data.page_info,
        };
      },
      staleTime: 60 * 1000 * 5,
    });
  }, [queryClient]);
  return (
    <div
      className={
        isMobile
          ? "min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA]"
          : "min-h-screen flex flex-col bg-[#f8f9fa]"
      }
    >
      {isMobile ? (
        <MobileHeader />
      ) : (
        <div className="max-mobile:hidden">
          <TabBar />
          <div className="w-full flex justify-center px-4 ">
            <img
              src="/assets/header/header.png"
              alt="HOM 배너"
              className="w-full max-w-6xl h-auto"
            />
          </div>
        </div>
      )}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 max-mobile:py-2 flex flex-col gap-2">
        <HotEventList />
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6 max-mobile:hidden">
            <ServiceLinkList />
            {/* <ClubCarousel /> 동아리 랜덤 포스터 API 제거로 임시 미사용 */}
          </aside>
          <main className="flex-1 min-w-0 w-full space-y-6">
            <CalendarSection />
          </main>
        </div>
      </div>

      {isMobile ? (
        <>
          <MobileFooter />
          <MobileTabBar activeIndex={0} />
        </>
      ) : <Footer />}
    </div>
  );
};

export default HOMPage;
