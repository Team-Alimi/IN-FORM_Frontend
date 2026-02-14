/**
 * 이벤트/동아리의 상태를 계산하는 유틸리티 함수
 */

/**
 * 시작일과 종료일을 기반으로 현재 상태를 반환
 * @param {string} startDate - 시작일 (YYYY-MM-DD 포맷)
 * @param {string} dueDate - 종료일 (YYYY-MM-DD 포맷)
 * @returns {string} - "예정"|"진행중"|"마감"
 */
export const getStatus = (startDate, dueDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  let text = "진행중";
  if (today < start) text = "예정";
  else if (today > end) text = "마감";

  const colorMap = {
    "예정": "text-Upcoming bg-red-50 border-Upcoming",
    "마감": "text-Ended bg-gray-100 border-Ended",
    "진행중": "text-Ongoing bg-blue-50 border-Ongoing",
  };

  return { text, color: colorMap[text] };
};
