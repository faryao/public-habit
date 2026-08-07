(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PublicHabit = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', api.init);
    } else {
      api.init();
    }
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const IDENTIFIER_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  function toDateKey(value) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0')
    ].join('-');
  }

  function dateKeyInTimeZone(timeZone, instant) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(instant || new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function fromDateKey(key) {
    return new Date(`${key}T12:00:00`);
  }

  function toMonthIndex(value) {
    return (value.getFullYear() * 12) + value.getMonth();
  }

  function fromMonthIndex(index) {
    const year = Math.floor(index / 12);
    const month = ((index % 12) + 12) % 12;
    const value = new Date(2000, month, 1, 12);
    value.setFullYear(year);
    return value;
  }

  function isValidDateKey(key) {
    if (!DATE_PATTERN.test(key)) return false;
    const value = fromDateKey(key);
    return !Number.isNaN(value.getTime()) && toDateKey(value) === key;
  }

  function proofTemplate(identifier, dateKey) {
    return `---\nhabit: ${identifier}\ndate: ${dateKey}\n---\n\nPaste the proof image here, then delete this instruction.\n`;
  }

  function newProofUrl(repository, identifier, dateKey) {
    const url = new URL(`https://github.com/${repository}/new/main/_proofs/${identifier}`);
    url.searchParams.set('filename', `${dateKey}.md`);
    url.searchParams.set('value', proofTemplate(identifier, dateKey));
    return url.toString();
  }

  function editUrl(repository, path) {
    return `https://github.com/${repository}/edit/main/${path.split('/').map(encodeURIComponent).join('/')}`;
  }

  function init() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const app = document.getElementById('habit-app');
    const calendarGrid = document.getElementById('calendar-grid');
    if (!app || !calendarGrid) return;

    const repository = app.dataset.repository;
    const timeZone = app.dataset.timeZone || 'Europe/Dublin';
    const habits = Array.from(app.querySelectorAll('[data-habit-id]')).map((link) => ({
      id: link.dataset.habitId,
      name: link.dataset.habitName,
      path: link.dataset.habitPath
    }));
    if (habits.length === 0) return;

    const habitIds = new Set(habits.map((habit) => habit.id));
    const proofsByHabit = new Map(habits.map((habit) => [habit.id, new Map()]));
    const warnings = [];

    habits.forEach((habit) => {
      if (!IDENTIFIER_PATTERN.test(habit.id)) {
        warnings.push({ message: `“${habit.id || 'unnamed'}” has an invalid Habit Identifier.`, path: habit.path });
      }
      if (!habit.name.trim()) {
        warnings.push({ message: `“${habit.id}” is missing a display name.`, path: habit.path });
      }
    });

    app.querySelectorAll('#proof-source [data-proof-habit]').forEach((source) => {
      const identifier = source.dataset.proofHabit;
      const dateKey = source.dataset.proofDate;
      if (!habitIds.has(identifier)) return;

      if (!isValidDateKey(dateKey)) {
        warnings.push({ message: `A proof for “${identifier}” has an invalid date.`, path: source.dataset.proofPath });
        return;
      }

      const image = source.querySelector('.proof-rendered img');
      const record = {
        dateKey,
        path: source.dataset.proofPath,
        url: source.dataset.proofUrl,
        image: image ? {
          src: image.currentSrc || image.src,
          alt: (image.getAttribute('alt') || '').trim()
        } : null
      };
      const records = proofsByHabit.get(identifier);
      if (records.has(dateKey)) {
        warnings.push({ message: `“${identifier}” has more than one proof for ${dateKey}.`, path: record.path });
        return;
      }
      records.set(dateKey, record);
    });

    const calendarLabel = document.getElementById('calendar-label');
    const calendarSummary = document.getElementById('calendar-summary');
    const selectedHabitLabel = document.getElementById('selected-habit-label');
    const previousMonth = document.getElementById('calendar-previous');
    const nextMonth = document.getElementById('calendar-next');
    const todayMonth = document.getElementById('calendar-today');
    const editHabitLink = document.getElementById('edit-habit-link');
    const warningPanel = document.getElementById('content-warnings');
    const warningList = document.getElementById('content-warning-list');
    const todayKey = dateKeyInTimeZone(timeZone);
    const todayDate = fromDateKey(todayKey);
    const currentMonthIndex = toMonthIndex(todayDate);
    const monthFormatter = new Intl.DateTimeFormat('en-IE', { month: 'long', year: 'numeric' });
    const fullDateFormatter = new Intl.DateTimeFormat('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const selectedHabit = habits.find((habit) => habit.id === app.dataset.selectedHabit) || habits[0];
    let displayedMonthIndex = currentMonthIndex;

    function renderWarnings() {
      if (!warningPanel || !warningList || warnings.length === 0) return;
      const fragment = document.createDocumentFragment();
      warnings.forEach((warning) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = editUrl(repository, warning.path);
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = warning.message;
        item.append(link);
        fragment.append(item);
      });
      warningList.replaceChildren(fragment);
      warningPanel.hidden = false;
    }

    function renderCalendar() {
      const monthDate = fromMonthIndex(displayedMonthIndex);
      const displayedYear = monthDate.getFullYear();
      const displayedMonth = monthDate.getMonth();
      const firstDay = new Date(displayedYear, displayedMonth, 1, 12);
      const leadingDays = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0, 12).getDate();
      const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
      const records = proofsByHabit.get(selectedHabit.id) || new Map();
      const fragment = document.createDocumentFragment();
      let validCount = 0;
      let missingCount = 0;
      let row;

      for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
        if (cellIndex % 7 === 0) {
          row = document.createElement('div');
          row.className = 'calendar-row';
          fragment.append(row);
        }

        const cell = document.createElement('div');
        const dayNumber = cellIndex - leadingDays + 1;
        cell.className = 'calendar-cell';

        if (dayNumber < 1 || dayNumber > daysInMonth) {
          cell.classList.add('is-placeholder');
          cell.setAttribute('aria-hidden', 'true');
          row.append(cell);
          continue;
        }

        const date = new Date(displayedYear, displayedMonth, dayNumber, 12);
        const dateKey = toDateKey(date);
        const record = records.get(dateKey);
        const fullDate = fullDateFormatter.format(date);
        const control = document.createElement('a');
        const number = document.createElement('time');
        control.className = 'calendar-day';
        control.target = '_blank';
        control.rel = 'noreferrer';
        number.dateTime = dateKey;
        number.textContent = String(dayNumber);
        control.append(number);

        if (!record) {
          control.classList.add('is-empty');
          control.href = newProofUrl(repository, selectedHabit.id, dateKey);
          control.setAttribute('aria-label', `Add proof for ${selectedHabit.name} on ${fullDate} using GitHub`);
          const action = document.createElement('span');
          action.className = 'empty-action';
          action.textContent = '＋';
          action.setAttribute('aria-hidden', 'true');
          control.append(action);
        } else if (!record.image) {
          missingCount += 1;
          control.classList.add('is-missing');
          control.href = editUrl(repository, record.path);
          control.setAttribute('aria-label', `Proof image missing for ${selectedHabit.name} on ${fullDate}; fix on GitHub`);
          const warning = document.createElement('span');
          warning.className = 'missing-action';
          warning.textContent = '!';
          warning.setAttribute('aria-hidden', 'true');
          control.append(warning);
        } else {
          validCount += 1;
          control.classList.add('has-proof');
          control.href = record.url;
          control.setAttribute('aria-label', `Open proof for ${selectedHabit.name} on ${fullDate}`);
          const image = document.createElement('img');
          image.src = record.image.src;
          image.alt = '';
          image.loading = 'lazy';
          image.decoding = 'async';
          control.prepend(image);
        }

        if (dateKey === todayKey) {
          control.classList.add('is-today');
          control.setAttribute('aria-current', 'date');
        }

        cell.append(control);
        row.append(cell);
      }

      const monthName = monthFormatter.format(monthDate);
      calendarLabel.textContent = monthName;
      selectedHabitLabel.textContent = selectedHabit.name;
      calendarSummary.textContent = `${validCount} image ${validCount === 1 ? 'proof' : 'proofs'}${missingCount ? ` · ${missingCount} missing ${missingCount === 1 ? 'image' : 'images'}` : ''}`;
      if (editHabitLink) {
        editHabitLink.href = editUrl(repository, selectedHabit.path);
        editHabitLink.setAttribute('aria-label', `Edit or delete ${selectedHabit.name} on GitHub`);
      }
      calendarGrid.replaceChildren(fragment);
      if (todayMonth) todayMonth.disabled = displayedMonthIndex === currentMonthIndex;
    }

    previousMonth.addEventListener('click', () => {
      displayedMonthIndex -= 1;
      renderCalendar();
    });
    nextMonth.addEventListener('click', () => {
      displayedMonthIndex += 1;
      renderCalendar();
    });
    todayMonth.addEventListener('click', () => {
      displayedMonthIndex = currentMonthIndex;
      renderCalendar();
    });

    renderWarnings();
    renderCalendar();
  }

  return {
    IDENTIFIER_PATTERN,
    dateKeyInTimeZone,
    editUrl,
    fromDateKey,
    fromMonthIndex,
    isValidDateKey,
    newProofUrl,
    proofTemplate,
    toDateKey,
    toMonthIndex,
    init
  };
}));
