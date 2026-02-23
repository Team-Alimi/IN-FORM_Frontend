import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CBLPage from "./pages/CBL/CBLPage";
import EVLPage from "./pages/EVL/EVLPage";
import EVDPage from "./pages/EVD/EVDPage";
import CBDPage from "./pages/CBD/CBDPage";
import HOMPage from "./pages/HOM/HOMPage";
import ErrorPage from "./pages/NOT/ErrorPage";
import { initDeviceListener } from "./stores/deviceStore";
import DeviceTestPage from "./pages/TEST/DeviceTestPage";
import LGNPage from "./pages/LGN/LGNPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MYPage from "./pages/MYP/MYPage";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    return initDeviceListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LGNPage />} />
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
        <Route path="/test" element={<DeviceTestPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route
          path="/mypage"
          element={
            <MYPage />
          }
        />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
