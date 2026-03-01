import { STATE_OPTIONS } from "../constants/filterOption";

const API_STATUS_MAP = {
  OPEN: { key: "OnGoing", text: "진행중" },
  ENDING_SOON: { key: "EndingSoon", text: "마감임박" },
  UPCOMING: { key: "UpComing", text: "예정" },
  CLOSED: { key: "Ended", text: "마감" },
};

/**
 * API status 문자열을 한국어 표시명과 색상으로 변환
 * @param {string} apiStatus - "OPEN" | "ENDING_SOON" | "UPCOMING" | "CLOSED"
 * @returns {{ text: string, color: string }}
 */
export const getStatus = (apiStatus) => {
  const mapped = API_STATUS_MAP[apiStatus];
  if (!mapped)
    return {
      text: apiStatus ?? "-",
      color: "text-gray-500 bg-gray-100 border-gray-300",
    };

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
