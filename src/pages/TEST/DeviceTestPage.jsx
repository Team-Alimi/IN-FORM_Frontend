import { useDeviceStore } from "../../stores/deviceStore";

const DeviceTestPage = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  return (
    <div>
      <div className="bg-red-700 max-mobile:bg-blue-400">
        <div className="p-4">테일위드 반응형 테스트</div>
      </div>
      {isMobile ? <div>모바일임</div> : <div>데스크탑임</div>}
    </div>
  );
};
export default DeviceTestPage;
