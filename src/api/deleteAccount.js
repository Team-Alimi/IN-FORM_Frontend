import instance from "./axios";

/**
 * 회원 탈퇴 기능 (유저 정보 및 연관 데이터 전체 삭제)
 * @returns {Promise}
 */
export async function deleteAccount() {
    try {
        const res = await instance.delete("/api/v1/users/me");
        return res.data;
    } catch (error) {
        console.error("[API] deleteAccount 에러 발생:", error);
        throw error;
    }
}
