const STATUS_TO_DEADLINE = {
  OPEN: "OPEN",
  ENDING_SOON: "CLOSING_SOON",
  CLOSING_SOON: "CLOSING_SOON",
  UPCOMING: "UPCOMING",
  CLOSED: "CLOSED",
  ALWAYS: "ALWAYS",
};

/** EVL 상태 선택을 공지 목록 API의 쉼표 구분 OR 필터로 변환한다. */
export const getDeadlineStatusParam = (statuses = []) => {
  if (statuses.includes("ALL")) return undefined;
  const values = statuses.map((status) => STATUS_TO_DEADLINE[status]).filter(Boolean);
  return [...new Set(values)].join(",") || undefined;
};
