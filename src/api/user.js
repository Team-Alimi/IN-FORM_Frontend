import api from "@/api/axios";

/**
 * 사용자 학과(major) 수정
 * @param {number} userId - 수정할 사용자의 고유 식별자
 * @param {number} majorId - 선택한 학과의 고유 ID (Vendor ID)
 * @returns {Promise}
 */
export async function patchUserMajor(userId, majorId) {
  try {
    const res = await api.patch(`/api/v1/users/${userId}/major`, {
      major_id: majorId,
    });
    return res.data;
  } catch (error) {
    console.error("[API] patchUserMajor 에러 발생:", error);
    throw error;
  }
}

/**
 * 회원 탈퇴 (유저 정보 및 연관 데이터 전체 삭제)
 * @returns {Promise}
 */
export async function deleteAccount() {
  try {
    const res = await api.delete("/api/v1/users/me");
    return res.data;
  } catch (error) {
    console.error("[API] deleteAccount 에러 발생:", error);
    throw error;
  }
}
