import instance from "./axios";

/**
 * 사용자 학과(major) 수정
 * @param {number} userId - 수정할 사용자의 고유 식별자
 * @param {number} majorId - 선택한 학과의 고유 ID (Vendor ID)
 * @returns {Promise}
 */
export async function patchUserMajor(userId, majorId) {
    try {
        const res = await instance.patch(`/api/v1/users/${userId}/major`, {
            major_id: majorId,
        });
        return res.data;
    } catch (error) {
        console.error("[API] patchUserMajor 에러 발생:", error);
        throw error;
    }
}
