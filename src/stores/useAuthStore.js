import { create } from "zustand";

const AuthStore = (set) => ({
  isLogIn: false,
  login: () => set({ isLogIn: true }),
  logout: () => set({ isLogIn: false }),
});

const useAuthStore = create(AuthStore);

export default useAuthStore;
