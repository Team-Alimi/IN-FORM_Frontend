/**
 * API status 문자열을 한국어 표시명과 색상으로 변환
 * @param {string} apiStatus - API 응답 status ("OPEN" | "ENDING_SOON" | "UPCOMING" | "CLOSED")
 * @returns {{ text: string, color: string }}
 */
export const getStatus = (apiStatus) => {
  const statusMap = {
    OPEN:         { text: "진행중",  color: "text-Ongoing bg-green-50 border-Ongoing" },
    ENDING_SOON:  { text: "마감임박", color: "text-EndingSoon bg-orange-50 border-EndingSoon" },
    UPCOMING:     { text: "예정",    color: "text-Upcoming bg-blue-50 border-Upcoming" },
    CLOSED:       { text: "마감",    color: "text-Ended bg-gray-100 border-Ended" },
  };

  return statusMap[apiStatus] ?? { text: apiStatus ?? "-", color: "text-gray-500 bg-gray-100 border-gray-300" };
};
