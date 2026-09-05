import api from "@/api/axios";

/**
 * 내 프로필 조회 (email_notification_enabled 포함)
 * @returns {Promise<Object>} { id, email, name, role, onboarding_completed, email_notification_enabled }
 */
export async function fetchMyProfile() {
  try {
    const res = await api.get("/api/v1/users/me");
    return res.data;
  } catch (error) {
    console.error("[API] fetchMyProfile 에러 발생:", error);
    throw error;
  }
}

/**
 * 알림 수신 설정 변경
 * @param {boolean} enabled - 마감 알림 메일 수신 여부
 * @returns {Promise<Object>} 갱신된 프로필 전체
 */
export async function patchNotificationSetting(enabled) {
  try {
    const res = await api.patch("/api/v1/users/me", {
      email_notification_enabled: enabled,
    });
    return res.data;
  } catch (error) {
    console.error("[API] patchNotificationSetting 에러 발생:", error);
    throw error;
  }
}

/**
 * 관심 공지 분야 조회
 * @returns {Promise<Object>} { success, data: [{ id, name }] }
 */
export async function fetchMyInterestCategories() {
  try {
    const res = await api.get("/api/v1/users/me/interests/categories");
    return res.data;
  } catch (error) {
    console.error("[API] fetchMyInterestCategories 에러 발생:", error);
    throw error;
  }
}

/**
 * 관심 공지 분야 저장 (전체 교체)
 * @param {number[]} ids - 선택한 category id 배열
 * @returns {Promise<Object>} { success, data: [{ id, name }] }
 */
export async function putMyInterestCategories(ids) {
  try {
    const res = await api.put("/api/v1/users/me/interests/categories", { ids });
    return res.data;
  } catch (error) {
    console.error("[API] putMyInterestCategories 에러 발생:", error);
    throw error;
  }
}

/**
 * 관심 동아리 유형 조회
 * @returns {Promise<Object>} { success, data: [{ id, name }] }
 */
export async function fetchMyClubTypes() {
  try {
    const res = await api.get("/api/v1/users/me/interests/club-types");
    return res.data;
  } catch (error) {
    console.error("[API] fetchMyClubTypes 에러 발생:", error);
    throw error;
  }
}

/**
 * 관심 동아리 유형 저장 (전체 교체)
 * @param {number[]} ids - 선택한 club-type id 배열
 * @returns {Promise<Object>} { success, data: [{ id, name }] }
 */
export async function putMyClubTypes(ids) {
  try {
    const res = await api.put("/api/v1/users/me/interests/club-types", { ids });
    return res.data;
  } catch (error) {
    console.error("[API] putMyClubTypes 에러 발생:", error);
    throw error;
  }
}

/**
 * 구독 학과·기관 조회
 * @returns {Promise<Object>} { success, data: [{ id, name }] }
 */
export async function fetchMyVendors() {
  try {
    const res = await api.get("/api/v1/users/me/vendors");
    return res.data;
  } catch (error) {
    console.error("[API] fetchMyVendors 에러 발생:", error);
    throw error;
  }
}

/**
 * 구독 학과·기관 저장 (전체 교체, SCHOOL 유형만 허용)
 * @param {number[]} ids - 선택한 vendor id 배열
 * @returns {Promise<Object>} { success, data: [{ id, name }] }
 */
export async function putMyVendors(ids) {
  try {
    const res = await api.put("/api/v1/users/me/vendors", { ids });
    return res.data;
  } catch (error) {
    console.error("[API] putMyVendors 에러 발생:", error);
    throw error;
  }
}

/**
 * 온보딩 완료 처리 — 3단계 선택 후 최종 호출
 * @returns {Promise<Object>} { success, data: 갱신된 프로필 }
 */
export async function postOnboardingComplete() {
  try {
    const res = await api.post("/api/v1/users/me/onboarding/complete");
    return res.data;
  } catch (error) {
    console.error("[API] postOnboardingComplete 에러 발생:", error);
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
