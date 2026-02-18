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

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    return initDeviceListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<HOMPage />} />
        <Route path="clubs">
          <Route index element={<CBLPage />} />
          <Route path="detail/:id" element={<CBDPage />} />
        </Route>
        <Route path="events">
          <Route index element={<EVLPage />} />
          <Route path="detail/:id" element={<EVDPage />} />
        </Route>
        <Route path="/test" element={<DeviceTestPage />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
