import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      isLogIn: false,
      accessToken: null,
      refreshToken: null,
      userInfo: null, // { user_id, email, name, major: { vendor_name, vendor_type ... } }

      // 로그인 성공 시 백엔드 응답을 받아 저장
      login: (accessToken, refreshToken, userInfo) =>
        set({
          isLogIn: true,
          accessToken,
          refreshToken,
          userInfo,
        }),

      // 토큰만 갱신 (axios 인터셉터의 토큰 재발급 후 호출)
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      // 유저 정보만 갱신 (온보딩 완료 후 프로필 업데이트 등)
      setUserInfo: (userInfo) => set({ userInfo }),

      // 로그아웃 시 토큰 및 회원정보 초기화
      logout: () =>
        set({
          isLogIn: false,
          accessToken: null,
          refreshToken: null,
          userInfo: null,
        }),
    }),
    {
      name: "auth-storage", // localStorage 키 이름
    }
  )
);

export default useAuthStore;
