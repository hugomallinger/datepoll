// Date picker panel. Lives in a shadow root so WhatsApp's styles and ours never mix.

const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const FILTERS = [['all', 'All'], ['weekdays', 'Weekdays'], ['weekends', 'Weekends']];
const LANG_CHOICES = [['auto', 'Auto'], ['en', 'EN'], ['de', 'DE'], ['fr', 'FR']];
const DEFAULT_QUESTION = {
  en: 'When works for you?',
  de: 'Wann passt es euch?',
  fr: 'Quand êtes-vous disponibles ?',
};

// Remembered across sessions. Days are not: they're different for every poll.
const SAVED_SETTINGS = ['filter', 'times', 'groupByWeek', 'multipleAnswers', 'question', 'lang'];

const PANEL_HTML = `
<link rel="stylesheet" href="${chrome.runtime.getURL('panel.css')}">
<div class="panel" role="dialog" aria-label="Date poll" tabindex="-1">
  <header>
    <span class="title">Date poll</span>
    <button type="button" class="icon close" aria-label="Close">×</button>
  </header>
  <div class="body">
    <label class="field">
      <span class="label">Question</span>
      <input type="text" class="question">
    </label>

    <div class="cal">
      <div class="cal-nav">
        <button type="button" class="icon prev" aria-label="Previous month">‹</button>
        <span class="month"></span>
        <button type="button" class="icon next" aria-label="Next month">›</button>
      </div>
      <div class="grid"></div>
      <p class="hint">Click days. Shift-click selects a range.</p>
    </div>

    <div class="row">
      <span class="label">Days</span>
      <div class="seg">${FILTERS.map(([v, l]) => `<button type="button" data-filter="${v}">${l}</button>`).join('')}</div>
    </div>

    <div class="row times">
      <span class="label">Times</span>
      <input type="text" class="time-input" placeholder="e.g. 18:00" aria-label="Add time">
      <div class="chips"></div>
    </div>

    <div class="row">
      <span class="label">Labels</span>
      <div class="seg">${LANG_CHOICES.map(([v, l]) => `<button type="button" data-lang="${v}">${l}</button>`).join('')}</div>
    </div>

    <label class="check"><input type="checkbox" class="group"> Group by week</label>
    <label class="check"><input type="checkbox" class="multiple"> Allow multiple answers</label>

    <div class="preview">
      <div class="preview-head"><span class="label">Options</span><span class="count"></span></div>
      <ol class="options"></ol>
      <div class="fixes"></div>
    </div>
  </div>
  <footer>
    <button type="button" class="btn clear">Clear</button>
    <button type="button" class="btn primary create">Create poll</button>
  </footer>
</div>`;

function createPanel({ onCreate }) {
  // The panel lives as long as the WhatsApp tab, often for days: open() moves this forward.
  let today = toDay(new Date());
  const state = {
    month: firstUsefulMonth(today), // 'YYYY-MM'
    days: new Set(),
    anchor: null, // last clicked day, start of a shift-click range
    filter: 'all',
    times: [],
    groupByWeek: false,
    multipleAnswers: true,
    question: null, // null = default question in the label language
    lang: 'auto', // 'auto' follows WhatsApp's language
  };

  // Only what the user sets directly is saved, key by key: a fix applied to one poll
  // (e.g. "Without times") must not overwrite their usual settings.
  const storage = globalThis.chrome?.storage?.sync;
  const changedHere = new Set();
  const save = (...keys) => {
    for (const k of keys) changedHere.add(k);
    storage?.set(Object.fromEntries(keys.map((k) => [k, state[k]])));
  };
  storage?.get(SAVED_SETTINGS).then((saved) => {
    // Settings can arrive after the user already changed something; theirs wins.
    for (const [k, v] of Object.entries(saved)) if (!changedHere.has(k)) state[k] = v;
    if (!host.hidden) render();
  });

  const labelLang = () => {
    if (state.lang !== 'auto') return state.lang;
    const wa = document.documentElement.lang.slice(0, 2);
    return wa in LABELS ? wa : 'en';
  };
  const question = () => state.question ?? DEFAULT_QUESTION[labelLang()];

  const host = document.createElement('div');
  host.id = 'datepoll-panel';
  host.hidden = true;
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = PANEL_HTML;
  document.body.appendChild(host);

  const $ = (sel) => root.querySelector(sel);
  const panel = $('.panel');
  let anchorButton = null;
  let fixes = []; // the fixes currently offered, indexed by data-fix

  // Replaces an element's content only when it changed. Re-rendering an unchanged part
  // (e.g. when the time field's blur fires on mousedown) would destroy the button
  // being clicked, and the click would never arrive.
  const lastHTML = new WeakMap();
  const setHTML = (el, html) => {
    if (lastHTML.get(el) === html) return;
    lastHTML.set(el, html);
    el.innerHTML = html;
  };

  // WhatsApp listens for keys on the document: it moves typing into the message box,
  // and Escape closes the chat. Keep our keystrokes to ourselves.
  for (const type of ['keydown', 'keyup', 'keypress', 'input', 'paste']) {
    host.addEventListener(type, (e) => e.stopPropagation());
  }

  const selection = () => ({
    days: [...state.days],
    filter: state.filter,
    times: state.times,
    groupByWeek: state.groupByWeek,
    lang: labelLang(),
  });

  // --- rendering ---

  function renderCalendar() {
    const [y, m] = state.month.split('-').map(Number);
    $('.month').textContent = `${MONTH_LONG[m - 1]} ${y}`;
    $('.prev').disabled = state.month <= today.slice(0, 7);

    const first = `${state.month}-01`;
    const offset = (parseDay(first).getDay() + 6) % 7; // Monday-based
    const count = daysInMonth(state.month);

    const cells = WEEKDAY_HEADERS.map((d) => `<span class="wd">${d}</span>`);
    for (let i = 0; i < offset; i++) cells.push('<span></span>');
    for (let i = 0; i < count; i++) {
      const day = addDays(first, i);
      const selected = state.days.has(day);
      const classes = [
        'day',
        day === today && 'today',
        selected && 'selected',
        selected && applyFilter([day], state.filter).length === 0 && 'excluded',
      ].filter(Boolean).join(' ');
      cells.push(`<button type="button" class="${classes}" data-day="${day}" ${day < today ? 'disabled' : ''}>${i + 1}</button>`);
    }
    setHTML($('.grid'), cells.join(''));
  }

  function renderControls() {
    for (const b of root.querySelectorAll('[data-filter]')) {
      b.classList.toggle('active', b.dataset.filter === state.filter);
    }
    for (const b of root.querySelectorAll('[data-lang]')) {
      b.classList.toggle('active', b.dataset.lang === state.lang);
    }
    // Don't overwrite the question while it's being typed.
    if (root.activeElement !== $('.question')) $('.question').value = question();
    setHTML($('.chips'), state.times
      .map((t) => `<span class="chip">${t}<button type="button" data-remove-time="${t}" aria-label="Remove ${t}">×</button></span>`)
      .join(''));
    // Hidden chips fade out at the edge, so it's clear there are more to scroll to.
    $('.chips').classList.toggle('overflow', $('.chips').scrollWidth > $('.chips').clientWidth);
    $('.times').classList.toggle('inactive', state.groupByWeek);
    $('.group').checked = state.groupByWeek;
    $('.multiple').checked = state.multipleAnswers;
  }

  function renderPreview() {
    const options = buildOptions(selection());
    const over = options.length > WA_MAX_OPTIONS;

    $('.count').textContent = `${options.length} / ${WA_MAX_OPTIONS}`;
    $('.count').classList.toggle('over', over);
    setHTML($('.options'), options.length
      ? options.map((o) => `<li>${o}</li>`).join('')
      : '<li class="empty">No days selected</li>');

    fixes = over ? suggestFixes(selection(), WA_MAX_OPTIONS) : [];
    setHTML($('.fixes'), over
      ? `<span>Too many options.</span>${fixes.map((f, i) => `<button type="button" class="fix" data-fix="${i}">${f.label} (${f.count})</button>`).join('')}`
      : '');
    $('.fixes').hidden = !over;

    $('.create').disabled = options.length < 2 || over;
  }

  function render() {
    renderCalendar();
    renderControls();
    renderPreview();
  }

  // --- input ---

  function clickDay(day, shift) {
    if (shift && state.anchor) {
      for (const d of daysBetween(state.anchor, day)) if (d >= today) state.days.add(d);
    } else if (state.days.has(day)) {
      state.days.delete(day);
    } else {
      state.days.add(day);
    }
    state.anchor = day;
  }

  function addTime() {
    const input = $('.time-input');
    if (!input.value.trim()) return;
    const time = normalizeTime(input.value);
    if (!time) {
      input.classList.add('invalid');
      return;
    }
    if (!state.times.includes(time)) state.times = [...state.times, time].sort();
    save('times');
    input.value = '';
    input.classList.remove('invalid');
    render();
  }

  function shiftMonth(delta) {
    const [y, m] = state.month.split('-').map(Number);
    state.month = toDay(new Date(y, m - 1 + delta, 1)).slice(0, 7);
    renderCalendar();
  }

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;

    if (t.dataset.day) {
      clickDay(t.dataset.day, e.shiftKey);
    } else if (t.dataset.filter) {
      state.filter = t.dataset.filter;
      save('filter');
    } else if (t.dataset.lang) {
      state.lang = t.dataset.lang;
      save('lang');
    } else if (t.dataset.removeTime) {
      state.times = state.times.filter((x) => x !== t.dataset.removeTime);
      save('times');
    } else if (t.dataset.fix) {
      Object.assign(state, fixes[Number(t.dataset.fix)].changes); // this poll only: not saved
    } else if (t.matches('.prev')) {
      return shiftMonth(-1);
    } else if (t.matches('.next')) {
      return shiftMonth(1);
    } else if (t.matches('.close')) {
      return close();
    } else if (t.matches('.clear')) {
      state.days.clear();
      state.anchor = null;
    } else if (t.matches('.create')) {
      const options = buildOptions(selection());
      close();
      return onCreate({ question: question().trim() || DEFAULT_QUESTION[labelLang()], options, multipleAnswers: state.multipleAnswers });
    } else {
      return;
    }
    render();
  });

  // Shift-click on day buttons would otherwise select page text.
  panel.addEventListener('mousedown', (e) => {
    if (e.shiftKey && e.target.closest('[data-day]')) e.preventDefault();
  });

  $('.question').addEventListener('input', (e) => {
    const value = e.target.value;
    // Empty or the default again means "use the default", so it follows the label language.
    state.question = value.trim() && value !== DEFAULT_QUESTION[labelLang()] ? value : null;
    save('question');
  });
  $('.group').addEventListener('change', (e) => { state.groupByWeek = e.target.checked; save('groupByWeek'); render(); });
  $('.multiple').addEventListener('change', (e) => { state.multipleAnswers = e.target.checked; save('multipleAnswers'); });

  // Only Enter adds: a comma is part of times like "9,30".
  $('.time-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTime();
    }
  });
  $('.time-input').addEventListener('input', (e) => e.target.classList.remove('invalid'));
  $('.time-input').addEventListener('blur', addTime);

  // Escape closes the panel and must never reach WhatsApp, which would close the chat.
  // Window capture runs before any of WhatsApp's listeners, wherever focus is.
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || host.hidden) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    close();
  }, true);

  // Click outside closes; the toggle button handles its own clicks.
  document.addEventListener('pointerdown', (e) => {
    if (host.hidden) return;
    const path = e.composedPath();
    if (!path.includes(host) && !path.includes(anchorButton)) close();
  }, true);

  // --- open / close ---

  function open(button) {
    const now = toDay(new Date());
    if (now !== today) {
      today = now;
      if (state.month < firstUsefulMonth(today)) state.month = firstUsefulMonth(today);
      for (const d of state.days) if (d < today) state.days.delete(d);
      if (state.anchor && state.anchor < today) state.anchor = null;
    }

    anchorButton = button;
    panel.dataset.theme = document.body.classList.contains('dark') ? 'dark' : 'light';

    const rect = button.getBoundingClientRect();
    Object.assign(host.style, {
      position: 'fixed',
      left: `${Math.max(8, rect.left)}px`,
      bottom: `${window.innerHeight - rect.top + 8}px`,
      zIndex: 1000,
    });
    panel.style.maxHeight = `${rect.top - 16}px`;

    host.hidden = false;
    render();
    // Keys go to the panel, not WhatsApp's message box. Clicking empty panel space keeps focus here too.
    panel.focus();
  }

  function close() {
    host.hidden = true;
  }

  return {
    toggle: (button) => (host.hidden ? open(button) : close()),
    close,
  };
}
