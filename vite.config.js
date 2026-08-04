// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ★ MOCK 모드 전환 방법:
//   - ON  (더미 데이터 사용) : 아래 mockAliases 객체 정의 줄과 스프레드 줄을 주석 해제
//   - OFF (실제 API 사용)   : 해당 두 줄을 주석 처리
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
      "@": path.resolve(__dirname, "./src"),
      ...mockAliases, // ← MOCK ON: 이 줄 주석 해제 / OFF: 주석 처리
    },
  },
});