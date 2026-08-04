/**
 * [MOCK] src/api/main/vendors.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 학과/제공처 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchVendors : vendor_type 으로 필터링 가능 ("DEPARTMENT" | "ORGANIZATION" | undefined)
 *                   마이페이지의 학과 변경 모달에서 사용됩니다.
 */
import { MOCK_VENDORS } from "@/mocks/data";

export const fetchVendors = async (type) => {
  const filtered = type
    ? MOCK_VENDORS.filter((v) => v.vendor_type === type)
    : MOCK_VENDORS;
  return { data: filtered };
};