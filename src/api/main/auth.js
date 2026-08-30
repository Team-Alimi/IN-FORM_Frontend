import api from "@/api/axios";

/**
 * 구글 로그인 ID 토큰을 백엔드로 전송하여 로그인/회원가입 처리
 * @param {string} idToken - 구글에서 발급받은 id_token
 * @returns {Promise<Object>} 백엔드 로그인 응답 데이터 (access_token, user_info 등)
 */
export const postGoogleLogin = async (idToken) => {
  try {
    const response = await api.post("/api/v1/auth/login/google", {
      id_token: idToken,
    });
    return response.data;
  } catch (error) {
    console.error("구글 로그인 API 통신 오류:", error);
    throw error;
  }
};

/**
 * 현재 기기 로그아웃 (Refresh Token 세션 종료)
 * @param {string} refreshToken - 현재 기기의 Refresh Token
 * @returns {Promise<Object>} { success: true }
 */
export const postLogout = async (refreshToken) => {
  try {
    const response = await api.post("/api/v1/auth/logout", {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    console.error("로그아웃 API 통신 오류:", error);
    throw error;
  }
};
