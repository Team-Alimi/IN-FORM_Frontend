import { useDeviceStore } from "../../stores/deviceStore";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";
import MobileFooter from "../../components/mobile/common/MobileFooter";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import MiniCalendarSet from "../../components/desktop/common/MiniCalendarSet";
import ClubListContainer from "../../components/adaptive/feature/CBL/ClubListContainer";

const CBLPage = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  // const [selectedCategory, setSelectedCategory] = useState("ALL");
  return (
    <div
      className={
        isMobile
          ? "min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA]"
          : "min-h-screen flex flex-col bg-[#f8f9fa]"
      }
    >
      {isMobile ? <MobileHeader /> : <TabBar />}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 max-mobile:py-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 왼쪽 사이드바 */}
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6 max-mobile:hidden">
            <MiniCalendarSet />
          </aside>

          {/* 오른쪽 메인 컨텐츠 */}
          <main
            className={
              isMobile
                ? "flex-1 w-full bg-[#F4F8FE] rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-3 pt-4 min-h-[500px] flex flex-col justify-between"
                : "flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6 md:p-8 min-h-[500px] flex flex-col justify-between"
            }
          >
            <ClubListContainer />
          </main>
          {/* <div className="w-full h-16"></div> */}
        </div>
      </div>

      {isMobile ? (
        <>
          <MobileFooter />
          <MobileTabBar activeIndex={2} />
        </>
      ) : <Footer />}
    </div>
  );
};

export default CBLPage;
