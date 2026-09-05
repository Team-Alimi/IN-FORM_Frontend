import axios from "axios";
import useAuthStore from "@/stores/useAuthStore";

const BASE_URL = "https://inha-inform.today/";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// 토큰 갱신 중 중복 요청 방지 (single-flight)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터: 저장된 accessToken을 Authorization 헤더에 추가
instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 수신 시 refresh token으로 재발급 후 원 요청 재시도
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 401이고 재시도가 아닌 요청만 처리 (refresh 엔드포인트 무한루프 방지)
    if (status === 401 && !originalRequest._retry) {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      // refresh token이 없으면 즉시 로그아웃
      if (!refreshToken) {
        logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // 이미 갱신 중이면 대기열에 추가 후 갱신 완료 시 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 인스턴스 대신 순수 axios 사용 (인터셉터 재귀 방지)
        const response = await axios.post(
          `${BASE_URL}api/v1/auth/token/refresh`,
          { refresh_token: refreshToken },
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );
        const { access_token, refresh_token } = response.data.data;
        setTokens(access_token, refresh_token);
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
