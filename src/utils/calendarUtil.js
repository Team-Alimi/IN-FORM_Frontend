import {
  formatDateKey,
  parseDate,
  isDateBefore,
  isDateAfter,
  isDateAfterOrEqual,
  isDateBeforeOrEqual,
} from "@/utils/dateUtil";

// 6주(42칸) 캘린더 그리드 생성
export function generateWeeks(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
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

// 중복 제거된 이벤트 수집
export function collectUniqueEvents(week, eventsByDate) {
  const uniqueEvents = new Map();

  week.forEach((cellData) => {
    if (!cellData) return;

    const dateKey = formatDateKey(cellData.date); //key: '2025-11-02'
    const dayEvents = eventsByDate[dateKey] || []; //value: [event1, event2, ...]

    dayEvents.forEach((event) => {
      if (!uniqueEvents.has(event.article_id)) {
        uniqueEvents.set(event.article_id, event);
      }
    });
  });

  return Array.from(uniqueEvents.values()); // 이벤트 객체들의 배열 반환
}

export function buildBars(week, events) {
  // 이벤트 바 생성
  const bars = [];
  const weekStart = week[0].date; // 주의 시작 날짜 {2025-11-02}
  const weekEnd = week[6].date; // 주의 끝 날짜 {2025-11-08}

  events.forEach((event) => {
    const eventStart = parseDate(event.start_date); //Date 객체
    const eventEnd = parseDate(event.due_date); //Date 객체
    if (!eventStart || !eventEnd) return;

    if (isDateBefore(eventEnd, weekStart) || isDateAfter(eventStart, weekEnd)) {
      // 주 밖 이벤트
      return;
    }

    let startCol = 0;
    if (
      isDateAfterOrEqual(eventStart, weekStart) &&
      isDateBeforeOrEqual(eventStart, weekEnd)
    ) {
      startCol = eventStart.getDay();
    }

    let endCol = 6;
    if (
      isDateAfterOrEqual(eventEnd, weekStart) &&
      isDateBeforeOrEqual(eventEnd, weekEnd)
    ) {
      endCol = eventEnd.getDay();
    }

    const span = endCol - startCol + 1;

    // 이벤트의 전체 기간 계산 (정렬 우선순위용)
    const totalDuration =
      Math.ceil((eventEnd - eventStart) / (1000 * 60 * 60 * 24)) + 1;

    if (span > 0) {
      bars.push({ event, startCol, span, totalDuration });
    }
  });
  bars.sort((a, b) => {
    if (b.span !== a.span) {
      return b.span - a.span; // span 길이 내림차순 정렬 (긴 이벤트가 위로)
    }
    return b.totalDuration - a.totalDuration; //span이 같으면 totalDuration으로 정렬 (전체 기간이 긴 것이 위로)
  });

  return bars;
}
export function assignRows(bars) {
  bars.forEach((bar, index) => {
    //index는 0부터 시작해서 반복 할 때 마다 1씩 증가
    let row = 0;
    const barEnd = bar.startCol + bar.span - 1; //barEnd : 이 주에서 마지막으로 차지하는 칸 번호

    for (let i = 0; i < index; i++) {
      const prevBar = bars[i];
      const prevBarEnd = prevBar.startCol + prevBar.span - 1;

      const overlaps = // 겹치는지 확인
        (bar.startCol >= prevBar.startCol && bar.startCol <= prevBarEnd) ||
        (prevBar.startCol >= bar.startCol && prevBar.startCol <= barEnd);

      if (overlaps && prevBar.row === row) {
        //둘이 가로가 겹치는데 row도 같다(같은 행이면)
        row++; // 아래 줄로 내려주자
      }
    }
    bar.row = row; //겹치는 행이 없는 경우 최종 행 할당
  });
}
export function filterByColumnLimit(week, bars, maxVisibleRows) {
  // 각 날짜(column)별로 그 날을 지나가는 이벤트가 몇 개인지 추적
  const columnCounts = Array(7).fill(0);
  const visibleBarSet = new Set();
  const overflowMap = {};

  // bars는 이미 span 내림차순으로 정렬되어 있음
  // 긴 이벤트부터 처리하면서 각 날짜의 제한을 체크
  bars.forEach((bar) => {
    const barEnd = bar.startCol + bar.span - 1;
    let canShow = true;

    // 이 이벤트가 지나가는 모든 날짜에서 아직 여유가 있는지 확인
    for (let col = bar.startCol; col <= barEnd; col++) {
      if (columnCounts[col] >= maxVisibleRows) {
        canShow = false;
        break;
      }
    }

    if (canShow) {
      // 표시 가능: 모든 날짜의 카운트 증가
      visibleBarSet.add(bar);
      for (let col = bar.startCol; col <= barEnd; col++) {
        columnCounts[col]++;
      }
    } else {
      // 표시 불가: overflow에 추가 (이벤트가 지나가는 모든 날짜에)
      for (let col = bar.startCol; col <= barEnd; col++) {
        if (!overflowMap[col]) {
          const dateKey = formatDateKey(week[col].date);
          overflowMap[col] = {
            dayIndex: col,
            dateKey,
            count: 0,
          };
        }
        overflowMap[col].count++;
      }
    }
  });

  return {
    visibleBars: Array.from(visibleBarSet),
    overflows: Object.values(overflowMap),
  };
}
