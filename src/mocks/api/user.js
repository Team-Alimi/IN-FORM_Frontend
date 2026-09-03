/**
 * [MOCK] src/api/main/user.js 의 더미 버전
 *
 * 실제 서버 대신 성공 응답을 즉시 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchMyProfile             : 현재 로그인 유저의 프로필 반환 (email_notification_enabled 포함)
 *   - patchNotificationSetting  : 알림 수신 설정 토글
 *   - patchUserMajor            : majorId 로 useAuthStore 의 userInfo.major 를 갱신
 *   - deleteAccount             : useAuthStore.logout() 을 호출하여 세션 상태 초기화
 *   - fetchMyInterestCategories : 관심 공지 분야 조회
 *   - putMyInterestCategories   : 관심 공지 분야 저장
 *   - fetchMyClubTypes          : 관심 동아리 유형 조회
 *   - putMyClubTypes            : 관심 동아리 유형 저장
 *   - fetchMyVendors            : 구독 학과·기관 조회
 *   - putMyVendors              : 구독 학과·기관 저장
 *   - postOnboardingComplete    : 온보딩 완료 처리
 */
import { MOCK_VENDORS, MOCK_SCHOOL_VENDORS, MOCK_USER } from "@/mocks/data";
import useAuthStore from "@/stores/useAuthStore";

// 알림 수신 설정을 메모리에서 관리 (초기값: true)
let mockEmailNotificationEnabled = true;

export const fetchMyProfile = async () => {
  const { userInfo } = useAuthStore.getState();
  return {
    success: true,
    data: {
      id: userInfo?.user_id ?? MOCK_USER.user_id,
      email: userInfo?.email ?? MOCK_USER.email,
      name: userInfo?.name ?? MOCK_USER.name,
      role: "USER",
      onboarding_completed: true,
      email_notification_enabled: mockEmailNotificationEnabled,
    },
  };
};

export const patchNotificationSetting = async (enabled) => {
  mockEmailNotificationEnabled = enabled;
  const { userInfo } = useAuthStore.getState();
  return {
    success: true,
    data: {
      id: userInfo?.user_id ?? MOCK_USER.user_id,
      email: userInfo?.email ?? MOCK_USER.email,
      name: userInfo?.name ?? MOCK_USER.name,
      role: "USER",
      onboarding_completed: true,
      email_notification_enabled: mockEmailNotificationEnabled,
    },
  };
};

export const patchUserMajor = async (_userId, majorId) => {
  // MOCK_VENDORS 에서 선택한 학과 정보를 찾아 userInfo.major 를 갱신
  const vendor = MOCK_VENDORS.find((v) => v.vendor_id === majorId);
  if (vendor) {
    const { userInfo } = useAuthStore.getState();
    useAuthStore.setState({ userInfo: { ...userInfo, major: vendor } });
  }
  return { data: { success: true } };
};

export const deleteAccount = async () => {
  // 세션 상태(isLogIn, 토큰, userInfo) 를 모두 초기화
  useAuthStore.getState().logout();
  return { data: { success: true } };
};

// 관심 공지 분야 메모리 관리 (초기값: 1, 3번 선택)
let mockInterestCategoryIds = [1, 3];

const MOCK_CATEGORY_NAMES = {
  1: "학사", 2: "장학금", 3: "공모전·대회", 4: "특강·세미나",
  5: "취업·인턴십", 6: "행사·축제", 7: "봉사활동", 8: "어학시험",
  9: "자격증", 10: "학술·연구",
};

export const fetchMyInterestCategories = async () => ({
  success: true,
  data: mockInterestCategoryIds.map((id) => ({ id, name: MOCK_CATEGORY_NAMES[id] })),
});

export const putMyInterestCategories = async (ids) => {
  mockInterestCategoryIds = [...ids];
  return fetchMyInterestCategories();
};

// 관심 동아리 유형 메모리 관리 (초기값: 1, 2번 선택)
let mockClubTypeIds = [1, 2];

// 실제 DB club_types.id 기준 (GET /api/v1/club-types 응답과 동일)
const MOCK_CLUB_TYPE_NAMES = {
  1: "학술/IT", 2: "봉사", 3: "음악/공연", 4: "체육/스포츠",
  5: "문화·예술", 6: "창업", 8: "종교", 10: "댄스",
};

export const fetchMyClubTypes = async () => ({
  success: true,
  data: mockClubTypeIds.map((id) => ({ id, name: MOCK_CLUB_TYPE_NAMES[id] })),
});

export const putMyClubTypes = async (ids) => {
  mockClubTypeIds = [...ids];
  return fetchMyClubTypes();
};

// 구독 학과·기관 메모리 관리 (초기값: 10, 20번 선택)
let mockVendorIds = [10, 20];

export const fetchMyVendors = async () => ({
  success: true,
  data: MOCK_SCHOOL_VENDORS.filter((v) => mockVendorIds.includes(v.id)),
});

export const putMyVendors = async (ids) => {
  mockVendorIds = [...ids];
  return fetchMyVendors();
};

export const postOnboardingComplete = async () => {
  const { userInfo } = useAuthStore.getState();
  return {
    success: true,
    data: {
      id: userInfo?.user_id ?? MOCK_USER.user_id,
      email: userInfo?.email ?? MOCK_USER.email,
      name: userInfo?.name ?? MOCK_USER.name,
      role: "USER",
      onboarding_completed: true,
      email_notification_enabled: mockEmailNotificationEnabled,
    },
  };
};
