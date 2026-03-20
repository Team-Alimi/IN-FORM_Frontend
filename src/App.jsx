import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initDeviceListener } from '@/stores/deviceStore';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ReactGA from 'react-ga4';
import AnalyticsTracker from '@/utils/AnalyticsTraker';
/*기본 페이지 목록*/
import CBLPage from '@/pages/main/CBL/CBLPage';
import EVLPage from '@/pages/main/EVL/EVLPage';
import EVDPage from '@/pages/main/EVD/EVDPage';
import CBDPage from '@/pages/main/CBD/CBDPage';
import HOMPage from '@/pages/main/HOM/HOMPage';
import ErrorPage from '@/pages/NOT/ErrorPage';
import LGNPage from '@/pages/main/LGN/LGNPage';
import MYPage from '@/pages/main/MYP/MYPage';
import ONBPage from '@/pages/main/ONB/ONBPage';
import PRIPage from '@/pages/main/PRI/PRIPage';
import TOSPage from '@/pages/main/TOS/TOSPage';
/**관리자 기능 페이지 목록*/
import MANHOMPage from '@/pages/manage/MANHOM/MANHOMPage';
import MANLGNPage from '@/pages/manage/MANLGN/MANLGNPage';
import MANDTEPage from '@/pages/manage/MANDTE/MANDTEPage';
import MANDTRPage from '@/pages/manage/MANDTR/MANDTRPage';
import MANGBGPage from '@/pages/manage/MANGBG/MANGBGPage';
import MANSTGPage from '@/pages/manage/MANSTG/MANSTGPage';
import MANURVPage from '@/pages/manage/MANURV/MANURVPage';

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
        {/* 메인 라우트*/}
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

        <Route path="/mypage" element={<MYPage />} />
        {/* 관리자 라우트 — /manage/* 경로 아래 전부 묶음 */}
        <Route path="/manage">
          <Route index element={<MANHOMPage />} />
          <Route path="login" element={<MANLGNPage />} />
          <Route path="detail" element={<MANDTRPage />} />
          <Route path="edit" element={<MANDTEPage />} />
          <Route path="staged" element={<MANSTGPage />} />
          <Route path="garbage" element={<MANGBGPage />} />
          <Route path="unreviewed" element={<MANURVPage />} />
        </Route>
          {/**공통 에러처리 */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
