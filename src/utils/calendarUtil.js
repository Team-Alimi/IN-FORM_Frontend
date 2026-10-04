export function generateWeeks(year, month, weekStartsOn = 0) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = (firstDayOfMonth.getDay() - weekStartsOn + 7) % 7;
  const daysInCurrent = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];

  // 1) 앞쪽: 지난달 날짜들 (흐릿하게 표시할 칸)
  for (let i = startWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrev - i);
    cells.push({ date, inCurrentMonth: false });
  }

  // 2) 이번 달 날짜들
  for (let d = 1; d <= daysInCurrent; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, inCurrentMonth: true });
  }

  // 3) 뒤쪽: 다음달 날짜들
  const remaining = 42 - cells.length; // 6주 * 7일 = 42칸
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push({ date, inCurrentMonth: false });
  }

  // 7개씩 잘라서 주 단위 배열로 변환
  const weeksArr = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeksArr.push(cells.slice(i, i + 7));
  }

  return weeksArr; // 2차원 배열 반환
}
