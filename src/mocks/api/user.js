/**
 * [MOCK] src/api/main/user.js 의 더미 버전
 *
 * 실제 서버 대신 성공 응답을 즉시 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - patchUserMajor : 학과 변경 (항상 성공 반환, 실제 store 값은 변경되지 않음)
 *   - deleteAccount  : 회원 탈퇴 (항상 성공 반환, 실제 동작 없음)
 */
export const patchUserMajor = async (userId, majorId) => {
  return { data: { success: true } };
};

export const deleteAccount = async () => {
  return { data: { success: true } };
};