/**
 * [MOCK] src/api/main/auth.js 의 더미 버전
 *
 * 실제 Google OAuth 대신 더미 토큰과 사용자 정보를 즉시 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - postGoogleLogin : 구글 로그인 (더미 access_token, refresh_token, user_info 반환)
 *
 * 참고: MOCK 모드에서는 useAuthStore 자체도 mock 버전으로 대체되어
 *        앱 시작 시 이미 로그인 상태이므로 이 함수가 실제로 호출될 일은 거의 없습니다.
 */
import { MOCK_USER } from "@/mocks/data";

export const postGoogleLogin = async (idToken) => {
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    user_info: MOCK_USER,
  };
};