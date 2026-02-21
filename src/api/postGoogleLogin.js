import instance from "./axios";

/**
 * 구글 로그인 ID 토큰을 백엔드로 전송하여 로그인/회원가입 처리
 * @param {string} idToken 구글에서 발급받은 id_token
 * @returns {Promise<Object>} 백엔드 로그인 응답 데이터 (access_token, user_info 등)
 */
export const postGoogleLogin = async (idToken) => {
    try {
        const response = await instance.post("/api/v1/auth/login/google", {
            id_token: idToken,
        });
        return response.data; // { success: true, data: { access_token, refresh_token, ... }, error: null }
    } catch (error) {
        console.error("구글 로그인 API 통신 오류:", error);
        throw error;
    }
};
