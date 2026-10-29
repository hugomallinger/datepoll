// Date logic: selected days + filter + times → poll option labels.
// Days are local 'YYYY-MM-DD' strings, so time zones never shift a date.
// No DOM access: runs in the extension and in Node tests.

// Label languages. `short` is weekday + day ("Mon 2"); a full label adds the month ("Mon 2 Nov").
const LABELS = {
  en: {
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    short: (wd, d) => `${wd} ${d}`,
  },
  de: {
    weekdays: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
    months: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
    short: (wd, d) => `${wd} ${d}.`,
  },
  fr: {
    weekdays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    months: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    short: (wd, d) => `${wd} ${d}`,
  },
};

function parseDay(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDay(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(day, n) {
  const date = parseDay(day);
  date.setDate(date.getDate() + n);
  return toDay(date);
}

// Inclusive; order of start and end doesn't matter (shift-click can go backwards).
function daysBetween(start, end) {
  if (start > end) [start, end] = [end, start];
  const days = [];
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);
  return days;
}

// month: 'YYYY-MM'
function daysInMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

// The month the calendar opens on: next month when fewer than 7 days of this one are left.
function firstUsefulMonth(today) {
  const daysLeft = daysInMonth(today.slice(0, 7)) - Number(today.slice(8)) + 1;
  return (daysLeft < 7 ? addDays(today, daysLeft) : today).slice(0, 7);
}

function isWeekend(day) {
  const weekday = parseDay(day).getDay();
  return weekday === 0 || weekday === 6;
}

// Monday of the day's week.
function weekStart(day) {
  return addDays(day, -((parseDay(day).getDay() + 6) % 7));
}

function shortDay(day, lang) {
  const l = LABELS[lang];
  const date = parseDay(day);
  return l.short(l.weekdays[date.getDay()], date.getDate());
}

const monthOf = (day, lang) => LABELS[lang].months[parseDay(day).getMonth()];

// "Mon 2 Nov" / "Mo. 2. Nov." / "lun. 2 nov."
function formatDay(day, lang = 'en') {
  return `${shortDay(day, lang)} ${monthOf(day, lang)}`;
}

// Splits sorted days into runs of consecutive days.
function consecutiveRuns(days) {
  const runs = [];
  for (const day of days) {
    const run = runs[runs.length - 1];
    if (run && addDays(run[run.length - 1], 1) === day) run.push(day);
    else runs.push([day]);
  }
  return runs;
}

// Labels a set of sorted days: "Mon 2 – Fri 6 Nov", "Mon 2, Wed 4 Nov",
// "Mon 2 – Tue 3, Fri 6 Nov". The month is written once when all days share it.
function formatDays(days, lang = 'en') {
  const runs = consecutiveRuns(days);
  const oneMonth = monthOf(days[0], lang) === monthOf(days[days.length - 1], lang);
  const label = oneMonth ? (d) => shortDay(d, lang) : (d) => formatDay(d, lang);
  const parts = runs.map((run) =>
    run.length === 1 ? label(run[0]) : `${label(run[0])} – ${label(run[run.length - 1])}`);
  return oneMonth ? `${parts.join(', ')} ${monthOf(days[0], lang)}` : parts.join(', ');
}

// Accepts "18:00", "18", "9.30", "9,30", "18h", "18h30". Returns "HH:MM", or null if invalid.
function normalizeTime(input) {
  const match = String(input).trim().match(/^(\d{1,2})(?:[:.,h](\d{2})?)?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function applyFilter(days, filter) {
  if (filter === 'weekdays') return days.filter((d) => !isWeekend(d));
  if (filter === 'weekends') return days.filter(isWeekend);
  return days;
}

// selection: { days, filter: 'all' | 'weekdays' | 'weekends', times, groupByWeek, lang }
// Grouping by week ignores times: a time slot across a whole week means nothing.
function buildOptions({ days, filter = 'all', times = [], groupByWeek = false, lang = 'en' }) {
  const selected = applyFilter([...new Set(days)].sort(), filter);

  if (groupByWeek) {
    const weeks = new Map();
    for (const day of selected) {
      const key = weekStart(day);
      if (!weeks.has(key)) weeks.set(key, []);
      weeks.get(key).push(day);
    }
    return [...weeks.values()].map((week) => formatDays(week, lang));
  }

  const slots = [...new Set(times.map(normalizeTime).filter(Boolean))].sort();
  if (slots.length === 0) return selected.map((d) => formatDay(d, lang));
  return selected.flatMap((day) => slots.map((time) => `${formatDay(day, lang)} · ${time}`));
}

// When a selection has too many options, list the single changes that bring it under the limit.
function suggestFixes(selection, max) {
  const count = (changes) => buildOptions({ ...selection, ...changes }).length;
  const candidates = [];

  if ((selection.filter ?? 'all') === 'all' && selection.days.some(isWeekend)) {
    candidates.push({ label: 'Weekdays only', changes: { filter: 'weekdays' } });
  }
  if ((selection.times ?? []).length > 0 && !selection.groupByWeek) {
    candidates.push({ label: 'Without times', changes: { times: [] } });
  }
  if (!selection.groupByWeek) {
    candidates.push({ label: 'Group by week', changes: { groupByWeek: true } });
  }

  return candidates
    .map((c) => ({ ...c, count: count(c.changes) }))
    .filter((c) => c.count >= 1 && c.count <= max);
}

if (typeof module !== 'undefined') {
  module.exports = {
    daysBetween, daysInMonth, firstUsefulMonth, isWeekend, weekStart,
    formatDay, formatDays, normalizeTime, buildOptions, suggestFixes,
  };
}
