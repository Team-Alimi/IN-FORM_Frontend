/**
 * [MOCK] src/stores/useAuthStore.js 의 더미 버전
 *
 * 실제 인증 스토어 대신 항상 로그인된 상태로 시작하는 스토어입니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 역할:
 *   - isLogIn: true 로 고정하여 ProtectedRoute 를 통과 (로그인 없이 앱 진입 가능)
 *   - userInfo 를 MOCK_USER 로 초기화하여 마이페이지 등에서 사용자 정보 표시
 *   - persist 미사용: localStorage 에 저장되지 않아 실제 auth-storage 와 충돌하지 않음
 *   - login / logout 은 no-op (실제 동작 없음)
 */
import { create } from "zustand";
import { MOCK_USER } from "@/mocks/data";

const useAuthStore = create(() => ({
  isLogIn: true,
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  userInfo: MOCK_USER,
  login: () => {},
  logout: () => {},
}));

export default useAuthStore;