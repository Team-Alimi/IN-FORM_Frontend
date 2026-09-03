/**
 * [MOCK] src/api/main/vendors.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 학과/제공처 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchVendors   : type="SCHOOL" 이면 MOCK_SCHOOL_VENDORS 반환,
 *                      그 외 vendor_type 으로 필터링 (기존 동작 유지)
 *   - fetchCategories: MOCK_CATEGORIES 반환
 *   - fetchClubTypes : MOCK_CLUB_TYPES 반환
 */
import { MOCK_VENDORS, MOCK_SCHOOL_VENDORS, MOCK_CATEGORIES, MOCK_CLUB_TYPES } from "@/mocks/data";

export const fetchVendors = async (type) => {
  if (type === "SCHOOL") {
    return { success: true, data: MOCK_SCHOOL_VENDORS };
  }
  const filtered = type
    ? MOCK_VENDORS.filter((v) => v.vendor_type === type)
    : MOCK_VENDORS;
  return { data: filtered };
};

export const fetchCategories = async () => ({
  success: true,
  data: MOCK_CATEGORIES,
});

export const fetchClubTypes = async () => ({
  success: true,
  data: MOCK_CLUB_TYPES,
});
