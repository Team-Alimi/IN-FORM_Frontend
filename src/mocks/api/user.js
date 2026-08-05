/**
 * [MOCK] src/api/main/user.js 의 더미 버전
 *
 * 실제 서버 대신 성공 응답을 즉시 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - patchUserMajor : majorId 로 useAuthStore 의 userInfo.major 를 갱신
 *   - deleteAccount  : useAuthStore.logout() 을 호출하여 세션 상태 초기화
 */
import { MOCK_VENDORS } from "@/mocks/data";
import useAuthStore from "@/stores/useAuthStore";

export const patchUserMajor = async (_userId, majorId) => {
  // MOCK_VENDORS 에서 선택한 학과 정보를 찾아 userInfo.major 를 갱신
  const vendor = MOCK_VENDORS.find((v) => v.vendor_id === majorId);
  if (vendor) {
    const { userInfo } = useAuthStore.getState();
    useAuthStore.setState({ userInfo: { ...userInfo, major: vendor } });
  }
  return { data: { success: true } };
};

export const deleteAccount = async () => {
  // 세션 상태(isLogIn, 토큰, userInfo) 를 모두 초기화
  useAuthStore.getState().logout();
  return { data: { success: true } };
};
