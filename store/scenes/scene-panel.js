// Builds a static Datepoll panel for the store scenes, with option labels from dates.js.
function scenePanel({ question, month, firstWeekday, monthDays, year, monthNum, selected, filter = 'all', times = [], lang = 'auto', groupByWeek = false, showLabels = false }) {
  const pad = (n) => String(n).padStart(2, '0');
  const days = selected.map((d) => `${year}-${pad(monthNum)}-${pad(d)}`);
  const selection = { days, filter, times, groupByWeek, lang: lang === 'auto' ? 'en' : lang };
  const options = buildOptions(selection);
  const over = options.length > 12;
  const fixes = over ? suggestFixes(selection, 12) : [];

  const cells = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => `<span class="wd">${d}</span>`);
  for (let i = 0; i < firstWeekday; i++) cells.push('<span></span>');
  for (let d = 1; d <= monthDays; d++) cells.push(`<button class="${selected.includes(d) ? 'day selected' : 'day'}">${d}</button>`);
  const seg = (items, active) => items.map(([v, l]) => `<button class="${v === active ? 'active' : ''}">${l}</button>`).join('');

  return `
  <div class="panel compact" data-theme="dark" style="max-height: none">
    <header><span class="title">Date poll</span><button class="icon close">×</button></header>
    <div class="body">
      <label class="field"><span class="label">Question</span><input type="text" class="question" value="${question}"></label>
      <div class="cal">
        <div class="cal-nav"><button class="icon prev">‹</button><span class="month">${month}</span><button class="icon next">›</button></div>
        <div class="grid">${cells.join('')}</div>
      </div>
      <div class="row"><span class="label">Days</span><div class="seg">${seg([['all', 'All'], ['weekdays', 'Weekdays'], ['weekends', 'Weekends']], filter)}</div></div>
      <div class="row times"><span class="label">Times</span><input type="text" class="time-input" placeholder="e.g. 18:00"><div class="chips">${times.map((t) => `<span class="chip">${t}<button>×</button></span>`).join('')}</div></div>
      ${showLabels ? '' : '<!--'}<div class="row"><span class="label">Labels</span><div class="seg">${seg([['auto', 'Auto'], ['en', 'EN'], ['de', 'DE'], ['fr', 'FR']], lang)}</div></div>${showLabels ? '' : '-->'}
      <div class="preview">
        <div class="preview-head"><span class="label">Options</span><span class="count${over ? ' over' : ''}">${options.length} / 12</span></div>
        <ol class="options">${options.map((o) => `<li>${o}</li>`).join('')}</ol>
        ${over ? `<div class="fixes"><span>Too many options.</span>${fixes.map((f) => `<button class="fix">${f.label} (${f.count})</button>`).join('')}</div>` : ''}
      </div>
    </div>
    <footer><button class="btn clear">Clear</button><button class="btn primary create">Create poll</button></footer>
  </div>`;
}
