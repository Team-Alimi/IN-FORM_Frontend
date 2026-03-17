import { useDeviceStore } from "@/stores/deviceStore";
import ClubListContainer from "@/components/adaptive/feature/CBL/ClubListContainer";
import ErrorPage from "@/pages/NOT/ErrorPage";

const DeviceTestPage = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-red-700 max-mobile:bg-blue-400">
        {" "}
        {/** 단순 스타일 변경 */}
        <div className="p-4">테일윈드 브레이크 포인트 기반 반응형 테스트</div>
        <div>파란색 : 모바일 빨간색 : 데스크탑</div>
      </div>
      <div>전역 상태관리로 반응형 구현할 때 : 전역으로 관리되고 있음</div>
      {isMobile ? ( // 아예 다른 컴포넌트 구조나 로직이 필요할 때
        <div className="bg-red-700">모바일임</div>
      ) : (
        <div className="bg-blue-400">데스크탑임</div>
      )}

      <ErrorPage />
    </div>
  );
};
export default DeviceTestPage;
