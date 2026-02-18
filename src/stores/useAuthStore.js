import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      isLogIn: false,
      login: () => set({ isLogIn: true }),
      logout: () => set({ isLogIn: false }),
    }),
    {
      name: "auth-storage", // localStorage 키 이름
    }
  )
);

export default useAuthStore;
