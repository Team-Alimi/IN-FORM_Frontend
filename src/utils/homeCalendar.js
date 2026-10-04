import { formatDateKey } from './dateUtil.js';

export const getHomeWeek = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return { date, inCurrentMonth: true };
  });
};

export const shiftHomeDate = (dateKey, days) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return formatDateKey(new Date(year, month - 1, day + days));
};
