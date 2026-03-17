//axios instance를 정의하는 파일
import axios from "axios";
import useAuthStore from "@/stores/useAuthStore";

const instance = axios.create({
  baseURL: "https://inha-inform.today/",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// 요청 인터셉터 추가
instance.interceptors.request.use(
  (config) => {
    // zustand 스토어에서 상태 가져오기 (localStorage의 auth-storage를 파싱)
    const token = useAuthStore.getState().accessToken;

    // 토큰이 존재하면 Authorization 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 (토큰 만료 처리)
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");

      // 스토어 초기화 (로그아웃 처리)
      useAuthStore.getState().logout();

      // 로그인 창으로 강제 이동
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
