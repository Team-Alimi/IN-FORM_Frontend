import { create } from "zustand";

const MOBILE_BREAKPOINT = 430;

export const useDeviceStore = create((set) => ({
  isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
}));

export const initDeviceListener = () => {
  const handler = () => {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    useDeviceStore.setState((state) =>
      state.isMobile !== isMobile ? { isMobile } : state
    );
  };

  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
};
