import { STATE_OPTIONS } from "@/constants/filterOption";

const API_STATUS_MAP = {
  OPEN: { key: "OnGoing", text: "진행중" },
  ENDING_SOON: { key: "EndingSoon", text: "마감임박" },
  CLOSING_SOON: { key: "EndingSoon", text: "마감임박" }, // v2 신규
  UPCOMING: { key: "UpComing", text: "예정" },
  CLOSED: { key: "Ended", text: "마감" },
  ALWAYS: null, // 상시 — 배지 없음
};

/**
 * API status 문자열을 한국어 표시명과 색상으로 변환
 * @param {string} apiStatus - "OPEN" | "CLOSING_SOON" | "UPCOMING" | "CLOSED" | "ALWAYS"
 * @returns {{ text: string, color: string } | null}
 */
export const getStatus = (apiStatus) => {
  if (!(apiStatus in API_STATUS_MAP))
    return {
      text: apiStatus ?? "-",
      color: "text-gray-500 bg-gray-100 border-gray-300",
    };

  const mapped = API_STATUS_MAP[apiStatus];
  if (!mapped) return null; // ALWAYS: 배지 없음

  const opt = STATE_OPTIONS.find((o) => o.key === mapped.key);
  if (!opt)
    return {
      text: mapped.text,
      color: "text-gray-500 bg-gray-100 border-gray-300",
    };

  return {
    text: mapped.text,
    color: `${opt.backgroundColor} ${opt.textColor} ${opt.borderColor}`,
  };
};
