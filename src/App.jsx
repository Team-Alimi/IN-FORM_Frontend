import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { initDeviceListener } from "./stores/deviceStore";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ReactGA from "react-ga4";
import AnalyticsTracker from "./utils/AnalyticsTraker";
/*페이지 목록*/
import CBLPage from "./pages/CBL/CBLPage";
import EVLPage from "./pages/EVL/EVLPage";
import EVDPage from "./pages/EVD/EVDPage";
import CBDPage from "./pages/CBD/CBDPage";
import HOMPage from "./pages/HOM/HOMPage";
import ErrorPage from "./pages/NOT/ErrorPage";
import LGNPage from "./pages/LGN/LGNPage";
import MYPage from "./pages/MYP/MYPage";
import ONBPage from "./pages/ONB/ONBPage";
import PRIPage from "./pages/PRI/PRIPage";
import TOSPage from "./pages/TOS/TOSPage";


const queryClient = new QueryClient(); //리액트 쿼리
ReactGA.initialize('G-ERJHX4CVB5'); //GA4 세팅 

function App() {
  useEffect(() => {
    return initDeviceListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsTracker />
      <Routes>
        <Route path="/login" element={<LGNPage />} />
        <Route path="/onboarding" element={<ONBPage />} />
        <Route path="/privacy-policy" element={<PRIPage />} />
        <Route path="/terms-of-service" element={<TOSPage />} />
        <Route path="/" element={<HOMPage />} />
        <Route path="clubs">
          <Route
            index
            element={
              <ProtectedRoute>
                <CBLPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="detail/:id"
            element={
              <ProtectedRoute>
                <CBDPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="events">
          <Route
            index
            element={
              <ProtectedRoute>
                <EVLPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="detail/:id"
            element={
              <ProtectedRoute>
                <EVDPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/error" element={<ErrorPage />} />
        <Route
          path="/mypage"
          element={
            <MYPage />
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
