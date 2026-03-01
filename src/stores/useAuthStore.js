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
