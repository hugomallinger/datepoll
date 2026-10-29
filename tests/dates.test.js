// Run: npm test (or: node --test "tests/*.test.js")
// 2026-11-02 is a Monday. 2026-10-25 is the end of daylight saving time in Europe.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  daysBetween, daysInMonth, firstUsefulMonth, isWeekend, weekStart,
  formatDay, formatDays, normalizeTime, buildOptions, suggestFixes,
} = require('../dates.js');

test('daysInMonth', () => {
  assert.equal(daysInMonth('2026-11'), 30);
  assert.equal(daysInMonth('2026-12'), 31);
  assert.equal(daysInMonth('2027-02'), 28);
  assert.equal(daysInMonth('2028-02'), 29);
});

test('firstUsefulMonth skips to next month when fewer than 7 days are left', () => {
  assert.equal(firstUsefulMonth('2026-10-24'), '2026-10'); // 8 days left
  assert.equal(firstUsefulMonth('2026-10-25'), '2026-10'); // 7 days left
  assert.equal(firstUsefulMonth('2026-10-26'), '2026-11'); // 6 days left
  assert.equal(firstUsefulMonth('2026-12-29'), '2027-01'); // across the year
  assert.equal(firstUsefulMonth('2026-11-01'), '2026-11');
});

test('formatDay', () => {
  assert.equal(formatDay('2026-11-02'), 'Mon 2 Nov');
  assert.equal(formatDay('2027-01-01'), 'Fri 1 Jan');
});

test('formatDay in German and French', () => {
  assert.equal(formatDay('2026-11-02', 'de'), 'Mo. 2. Nov.');
  assert.equal(formatDay('2027-03-07', 'de'), 'So. 7. März');
  assert.equal(formatDay('2026-11-02', 'fr'), 'lun. 2 nov.');
  assert.equal(formatDay('2027-08-01', 'fr'), 'dim. 1 août');
});

test('daysBetween is inclusive and order-independent', () => {
  assert.deepEqual(daysBetween('2026-11-02', '2026-11-04'), ['2026-11-02', '2026-11-03', '2026-11-04']);
  assert.deepEqual(daysBetween('2026-11-04', '2026-11-02'), ['2026-11-02', '2026-11-03', '2026-11-04']);
  assert.deepEqual(daysBetween('2026-11-02', '2026-11-02'), ['2026-11-02']);
});

test('daysBetween across month, year and daylight saving change', () => {
  assert.deepEqual(daysBetween('2026-10-30', '2026-11-01'), ['2026-10-30', '2026-10-31', '2026-11-01']);
  assert.deepEqual(daysBetween('2026-12-31', '2027-01-01'), ['2026-12-31', '2027-01-01']);
  assert.deepEqual(daysBetween('2026-10-24', '2026-10-26'), ['2026-10-24', '2026-10-25', '2026-10-26']);
});

test('isWeekend', () => {
  assert.equal(isWeekend('2026-11-06'), false); // Fri
  assert.equal(isWeekend('2026-11-07'), true); // Sat
  assert.equal(isWeekend('2026-11-08'), true); // Sun
});

test('weekStart returns the Monday', () => {
  assert.equal(weekStart('2026-11-02'), '2026-11-02');
  assert.equal(weekStart('2026-11-08'), '2026-11-02');
  assert.equal(weekStart('2026-11-01'), '2026-10-26');
});

test('formatDays: consecutive days become a range', () => {
  assert.equal(formatDays(daysBetween('2026-11-02', '2026-11-06')), 'Mon 2 – Fri 6 Nov');
  assert.equal(formatDays(daysBetween('2026-10-26', '2026-11-01')), 'Mon 26 Oct – Sun 1 Nov');
  assert.equal(formatDays(['2026-11-02']), 'Mon 2 Nov');
});

test('formatDays: gaps are listed, never shown as one range', () => {
  assert.equal(formatDays(['2026-11-02', '2026-11-04', '2026-11-06']), 'Mon 2, Wed 4, Fri 6 Nov');
  assert.equal(formatDays(['2026-11-02', '2026-11-03', '2026-11-06']), 'Mon 2 – Tue 3, Fri 6 Nov');
  assert.equal(formatDays(['2026-10-27', '2026-10-28', '2026-11-01']), 'Tue 27 Oct – Wed 28 Oct, Sun 1 Nov');
});

test('formatDays in German and French', () => {
  const days = ['2026-11-02', '2026-11-03', '2026-11-06'];
  assert.equal(formatDays(days, 'de'), 'Mo. 2. – Di. 3., Fr. 6. Nov.');
  assert.equal(formatDays(days, 'fr'), 'lun. 2 – mar. 3, ven. 6 nov.');
});

test('normalizeTime', () => {
  assert.equal(normalizeTime('18:00'), '18:00');
  assert.equal(normalizeTime('18'), '18:00');
  assert.equal(normalizeTime('9.30'), '09:30');
  assert.equal(normalizeTime('9,30'), '09:30');
  assert.equal(normalizeTime('18h'), '18:00');
  assert.equal(normalizeTime('18h30'), '18:30');
  assert.equal(normalizeTime(' 7:05 '), '07:05');
  assert.equal(normalizeTime('24:00'), null);
  assert.equal(normalizeTime('18:60'), null);
  assert.equal(normalizeTime('evening'), null);
  assert.equal(normalizeTime(''), null);
});

test('buildOptions sorts and removes duplicate days', () => {
  assert.deepEqual(
    buildOptions({ days: ['2026-11-04', '2026-11-02', '2026-11-04'] }),
    ['Mon 2 Nov', 'Wed 4 Nov'],
  );
});

test('buildOptions filters', () => {
  const days = daysBetween('2026-11-06', '2026-11-09'); // Fri–Mon
  assert.deepEqual(buildOptions({ days, filter: 'weekdays' }), ['Fri 6 Nov', 'Mon 9 Nov']);
  assert.deepEqual(buildOptions({ days, filter: 'weekends' }), ['Sat 7 Nov', 'Sun 8 Nov']);
});

test('buildOptions with times: per day, times sorted, invalid and duplicate times dropped', () => {
  assert.deepEqual(
    buildOptions({ days: ['2026-11-02', '2026-11-03'], times: ['20:00', '18', 'later', '18:00'] }),
    ['Mon 2 Nov · 18:00', 'Mon 2 Nov · 20:00', 'Tue 3 Nov · 18:00', 'Tue 3 Nov · 20:00'],
  );
});

test('buildOptions grouped by week ignores times and uses selected first/last day', () => {
  const days = [...daysBetween('2026-11-04', '2026-11-08'), ...daysBetween('2026-11-09', '2026-11-11')];
  assert.deepEqual(
    buildOptions({ days, times: ['18:00'], groupByWeek: true }),
    ['Wed 4 – Sun 8 Nov', 'Mon 9 – Wed 11 Nov'],
  );
  assert.deepEqual(
    buildOptions({ days, filter: 'weekdays', groupByWeek: true }),
    ['Wed 4 – Fri 6 Nov', 'Mon 9 – Wed 11 Nov'],
  );
});

test('buildOptions uses the label language', () => {
  assert.deepEqual(
    buildOptions({ days: ['2026-11-02'], times: ['18:00'], lang: 'de' }),
    ['Mo. 2. Nov. · 18:00'],
  );
});

test('suggestFixes lists only changes that fit the limit', () => {
  const twoWeeks = daysBetween('2026-11-02', '2026-11-15');

  // 14 days → weekdays (10) and weeks (2) fit
  assert.deepEqual(
    suggestFixes({ days: twoWeeks }, 12).map((s) => [s.label, s.count]),
    [['Weekdays only', 10], ['Group by week', 2]],
  );

  // 14 days × 2 times = 28 → only grouping by week fits (weekdays 20, no times 14)
  assert.deepEqual(
    suggestFixes({ days: twoWeeks, times: ['18:00', '20:00'] }, 12).map((s) => [s.label, s.count]),
    [['Group by week', 2]],
  );
});
