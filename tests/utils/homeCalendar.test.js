import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getHomeWeek, shiftHomeDate } from '../../src/utils/homeCalendar.js';
import { formatDateKey } from '../../src/utils/dateUtil.js';

test('Monday week preserves all seven dates across a year boundary', () => {
  const dates = getHomeWeek('2027-01-01').map(({ date }) => formatDateKey(date));
  assert.deepEqual(dates, ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']);
});
test('week navigation handles leap days and year boundaries', () => {
  assert.equal(shiftHomeDate('2028-02-29', 7), '2028-03-07');
  assert.equal(shiftHomeDate('2027-01-01', -7), '2026-12-25');
});
