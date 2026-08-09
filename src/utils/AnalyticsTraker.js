import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 관리자 페이지(/manage/*)는 방문자 집계에서 제외합니다.
    // 관리자용 화면이므로 사용자 트래픽 통계에 포함되면 안 됩니다.
    if (location.pathname.startsWith("/manage")) return;

    // 사용자가 현재 보고 있는 주소(path)를 GA4로 보냅니다.
    // 예: /home, /about 등
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search
    });
  }, [location]); // 페이지 경로(location)가 바뀔 때마다 이 코드가 실행됩니다.

  return null; // 화면에 아무것도 그리지 않는 '기능용' 컴포넌트입니다.
};

export default AnalyticsTracker;