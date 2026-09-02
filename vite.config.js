// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ★ MOCK 모드 전환 방법:
//   - ON  (더미 데이터 사용) : 아래 useMocks 를 true 로 변경
//   - OFF (실제 API 사용)   : false 로 유지 (기본값)
const useMocks = false;

const mockAliases = {
  "@/api/main/articles": path.resolve(__dirname, "src/mocks/api/articles.js"),
  "@/api/main/calendar": path.resolve(__dirname, "src/mocks/api/calendar.js"),
  "@/api/main/bookmarks": path.resolve(__dirname, "src/mocks/api/bookmarks.js"),
  "@/api/main/notifications": path.resolve(__dirname, "src/mocks/api/notifications.js"),
  "@/api/main/vendors": path.resolve(__dirname, "src/mocks/api/vendors.js"),
  "@/api/main/user": path.resolve(__dirname, "src/mocks/api/user.js"),
  "@/api/main/auth": path.resolve(__dirname, "src/mocks/api/auth.js"),
  "@/stores/useAuthStore": path.resolve(__dirname, "src/mocks/stores/useAuthStore.js"),
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      ...(useMocks ? mockAliases : {}), // 반드시 "@" 보다 앞에 위치해야 함
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
