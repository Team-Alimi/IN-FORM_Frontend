import Footer from "../../components/desktop/common/Footer";
import TabBar from "../../components/desktop/common/TabBar";
import ServiceLinkList from "../../components/desktop/common/ServiceLinkList";
import CalendarSection from "../../components/adaptive/feature/HOM/CalendarSection";

const HOMPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 ">
      <div className="max-mobile:hidden">
        <TabBar />
        <div className="w-full flex justify-center px-4 mt-6 ">
          <img
            src="/assets/header/header.png"
            alt="HOM 배너"
            className="w-full max-w-6xl h-auto"
          />
        </div>
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6 max-mobile : hidden">
            <ServiceLinkList />
            {/* <ClubCarousel /> 동아리 랜덤 포스터 API 제거로 임시 미사용 */}
          </aside>
          <main className="flex-1 w-full space-y-6">
            <CalendarSection />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HOMPage;
