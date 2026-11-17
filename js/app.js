/* Логика страницы: переключение группы/недели и отрисовка таблиц. */
(function () {
  'use strict';

  var DATA = window.SCHEDULE_DATA;

  var state = {
    group: DATA.groups[0].id,
    week: 'even',
    weekAuto: true,
    view: 'schedule',
  };

  var els = {
    org: document.getElementById('org'),
    title: document.getElementById('title'),
    period: document.getElementById('period'),
    groupSwitch: document.getElementById('group-switch'),
    weekSwitch: document.getElementById('week-switch'),
    autoWeek: document.getElementById('auto-week'),
    tabs: Array.prototype.slice.call(document.querySelectorAll('.tab')),
    views: Array.prototype.slice.call(document.querySelectorAll('.view')),
    scheduleTable: document.getElementById('schedule-table'),
    bellsTable: document.getElementById('bells-table'),
    clockTime: document.getElementById('clock-time'),
    clockHour: document.getElementById('clock-hour'),
    clockMinute: document.getElementById('clock-minute'),
    clockSecond: document.getElementById('clock-second'),
    clockTicks: document.getElementById('clock-ticks'),
    installBtn: document.getElementById('install-btn'),
    installModal: document.getElementById('install-modal'),
    installSteps: document.getElementById('install-steps'),
    installNative: document.getElementById('install-native'),
    installClose: document.getElementById('install-close'),
  };

  // ── Утилиты ──────────────────────────────────────────────────────

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function groupById(id) {
    return DATA.groups.filter(function (g) { return g.id === id; })[0];
  }

  /* Сегодняшний день недели в формате данных: mon..fri (или null). */
  function todayId() {
    var map = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' };
    return map[new Date().getDay()] || null;
  }

  // ── Текущая неделя ───────────────────────────────────────────────

  function parseLocalDate(value) {
    var parts = String(value).split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function startOfWeek(date) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var day = d.getDay(); // 0 — воскресенье
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return d;
  }

  /*
   * Чётность недели считается от опорной недели из DATA.meta.weekRule.
   * Это позволяет не зависеть от номера недели в календаре.
   */
  function currentWeek() {
    var rule = DATA.meta.weekRule;
    if (!rule || !rule.anchorMonday) return 'even';

    var anchor = startOfWeek(parseLocalDate(rule.anchorMonday));
    var today = startOfWeek(new Date());
    var weeks = Math.round((today - anchor) / 604800000);
    var base = rule.anchorWeek === 'odd' ? 1 : 0;
    var parity = ((base + weeks) % 2 + 2) % 2;

    return parity === 0 ? 'even' : 'odd';
  }

  function effectiveWeek() {
    return state.weekAuto ? currentWeek() : state.week;
  }

  // ── Состояние в адресной строке ──────────────────────────────────

  function readHash() {
    var params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    var group = params.get('group');
    var week = params.get('week');
    var view = params.get('view');

    if (group && groupById(group)) state.group = group;
    if (week === 'auto') {
      state.weekAuto = true;
    } else if (week === 'even' || week === 'odd') {
      state.week = week;
      state.weekAuto = false;
    }
    if (view === 'schedule' || view === 'bells') state.view = view;
  }

  function writeHash() {
    var params = new URLSearchParams();
    params.set('group', state.group);
    params.set('week', state.weekAuto ? 'auto' : state.week);
    params.set('view', state.view);
    history.replaceState(null, '', '#' + params.toString());
  }

  // ── Отрисовка ────────────────────────────────────────────────────

  function renderHeader() {
    els.org.textContent = DATA.meta.org;
    els.title.textContent = DATA.meta.title;
    els.period.textContent = DATA.meta.period;
    document.title = DATA.meta.title + ' — ' + DATA.meta.org;
  }

  function renderGroupSwitch() {
    els.groupSwitch.innerHTML = DATA.groups.map(function (group) {
      return '<button class="segmented__btn" type="button" data-group="' +
        escapeHtml(group.id) + '">' + escapeHtml(group.name) + '</button>';
    }).join('');
  }

  function syncControls() {
    Array.prototype.forEach.call(els.groupSwitch.querySelectorAll('[data-group]'), function (btn) {
      btn.classList.toggle('is-active', btn.dataset.group === state.group);
      btn.setAttribute('aria-pressed', String(btn.dataset.group === state.group));
    });
    var week = effectiveWeek();
    Array.prototype.forEach.call(els.weekSwitch.querySelectorAll('[data-week]'), function (btn) {
      btn.classList.toggle('is-active', btn.dataset.week === week);
      btn.setAttribute('aria-pressed', String(btn.dataset.week === week));
    });
    els.autoWeek.classList.toggle('is-active', state.weekAuto);
    els.autoWeek.setAttribute('aria-pressed', String(state.weekAuto));
    els.tabs.forEach(function (tab) {
      var active = tab.dataset.view === state.view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-current', active ? 'page' : 'false');
    });
    els.views.forEach(function (view) {
      var active = view.id === 'view-' + state.view;
      view.classList.toggle('is-active', active);
      view.hidden = !active;
    });
  }

  function lessonsFor(dayId, pairNumber) {
    return DATA.lessons.filter(function (lesson) {
      return lesson.day === dayId &&
        lesson.pair === pairNumber &&
        (lesson.week === effectiveWeek() || lesson.week === 'both') &&
        lesson.groups.indexOf(state.group) !== -1;
    });
  }

  function renderLesson(lesson) {
    var type = lesson.typeLabel
      ? '<span class="lesson__type">' + escapeHtml(lesson.typeLabel) + '</span>'
      : '';

    var meta = '';
    if (lesson.teacher) {
      meta += '<div class="lesson__meta">' + escapeHtml(lesson.teacher) + '</div>';
    }
    if (lesson.room) {
      meta += '<div class="lesson__meta lesson__room">ауд. ' + escapeHtml(lesson.room) + '</div>';
    }

    return '<article class="lesson lesson--' + escapeHtml(lesson.type) + '">' +
      (type ? '<div class="lesson__head">' + type + '</div>' : '') +
      '<div class="lesson__subject">' + escapeHtml(lesson.subject) + '</div>' +
      meta +
      '</article>';
  }

  function renderSchedule() {
    var today = todayId();

    var head = '<thead><tr>' +
      '<th class="schedule__pair-col" scope="col">Пара</th>' +
      DATA.days.map(function (day) {
        var isToday = day.id === today;
        return '<th scope="col" class="' + (isToday ? 'is-today' : '') + '">' +
          '<span class="schedule__day">' + escapeHtml(day.name) + '</span>' +
          '<span class="schedule__day-short">' + escapeHtml(day.short) + '</span>' +
          '</th>';
      }).join('') +
      '</tr></thead>';

    var body = '<tbody>' + DATA.pairs.map(function (pair) {
      var cells = DATA.days.map(function (day) {
        var lessons = lessonsFor(day.id, pair.number);
        var isToday = day.id === today;

        if (!lessons.length) {
          return '<td class="schedule__cell is-empty' + (isToday ? ' is-today' : '') + '">' +
            '<span class="empty-mark">—</span></td>';
        }

        return '<td class="schedule__cell' + (isToday ? ' is-today' : '') + '">' +
          lessons.map(renderLesson).join('') + '</td>';
      }).join('');

      return '<tr>' +
        '<th class="schedule__pair-col" scope="row">' +
        '<span class="pair-label">' + escapeHtml(pair.label) + '</span>' +
        '<span class="pair-sub">пара</span>' +
        '</th>' + cells +
        '</tr>';
    }).join('') + '</tbody>';

    els.scheduleTable.innerHTML = head + body;
  }

  function renderBells() {
    var tbody = els.bellsTable.querySelector('tbody');
    tbody.innerHTML = DATA.bells.map(function (row) {
      if (row.break) {
        return '<tr class="is-break">' +
          '<td>Перерыв</td>' +
          '<td>' + escapeHtml(row.start) + '</td>' +
          '<td>' + escapeHtml(row.end) + '</td>' +
          '</tr>';
      }
      return '<tr>' +
        '<td><span class="pair-label">' + toRoman(row.pair) + '</span> пара</td>' +
        '<td>' + escapeHtml(row.start) + '</td>' +
        '<td>' + escapeHtml(row.end) + '</td>' +
        '</tr>';
    }).join('');
  }

  function toRoman(number) {
    var numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    return numerals[number - 1] || String(number);
  }

  function render() {
    syncControls();
    renderSchedule();
  }

  // ── Часы GMT+3 ──────────────────────────────────────────────────

  function pad2(number) {
    return number < 10 ? '0' + number : String(number);
  }

  function renderClockTicks() {
    var markup = '';

    for (var i = 0; i < 60; i++) {
      var major = i % 5 === 0;
      var angle = (i * 6 - 90) * Math.PI / 180;
      var inner = major ? 93 : 99;
      var outer = 104;

      var x1 = (120 + Math.cos(angle) * inner).toFixed(2);
      var y1 = (120 + Math.sin(angle) * inner).toFixed(2);
      var x2 = (120 + Math.cos(angle) * outer).toFixed(2);
      var y2 = (120 + Math.sin(angle) * outer).toFixed(2);

      markup += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
        '" stroke="#8ad9ac" stroke-opacity="' + (major ? 0.55 : 0.18) +
        '" stroke-width="' + (major ? 1.8 : 1) + '" stroke-linecap="round" />';
    }

    els.clockTicks.innerHTML = markup;
  }

  function updateClock() {
    // GMT+3 без перехода на летнее время
    var now = new Date(Date.now() + 3 * 3600000);
    var hours = now.getUTCHours();
    var minutes = now.getUTCMinutes();
    var seconds = now.getUTCSeconds();

    els.clockHour.setAttribute('transform',
      'rotate(' + ((hours % 12) * 30 + minutes * 0.5) + ' 120 120)');
    els.clockMinute.setAttribute('transform',
      'rotate(' + (minutes * 6 + seconds * 0.1) + ' 120 120)');
    els.clockSecond.setAttribute('transform',
      'rotate(' + (seconds * 6) + ' 120 120)');

    els.clockTime.textContent = pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds);
  }

  // ── Установка на главный экран ──────────────────────────────────

  var installPrompt = null;
  var standaloneQuery = window.matchMedia('(display-mode: standalone)');

  function isStandalone() {
    return standaloneQuery.matches || window.navigator.standalone === true;
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  }

  function isAndroid() {
    return /Android/i.test(window.navigator.userAgent);
  }

  function isLocalFile() {
    return window.location.protocol === 'file:';
  }

  function syncInstallButton() {
    els.installBtn.hidden = isStandalone();
  }

  /* Текст инструкции зависит от устройства и от того, умеет ли браузер установку. */
  function installSteps() {
    if (isLocalFile()) {
      return [
        'Сейчас сайт открыт с диска компьютера — такой адрес телефону недоступен.',
        'Сначала разместите сайт на хостинге, откройте его адрес на телефоне и нажмите эту кнопку ещё раз.'
      ];
    }

    if (installPrompt) {
      return [
        'Нажмите <b>«Установить»</b> ниже — браузер сам добавит сайт на главный экран.',
        'Если окно не появилось: меню браузера <b>⋮</b> → <b>«Установить приложение»</b> (или «Добавить на главный экран»).'
      ];
    }

    if (isIOS()) {
      return [
        'Откройте сайт в <b>Safari</b> — на iPhone ярлык добавляется только из него.',
        'Нажмите кнопку <b>«Поделиться»</b> внизу экрана (квадрат со стрелкой вверх).',
        'Пролистайте список, выберите <b>«На экран „Домой“»</b> и подтвердите — <b>«Добавить»</b>.'
      ];
    }

    if (isAndroid()) {
      return [
        'Нажмите меню браузера <b>⋮</b> в правом верхнем углу.',
        'Выберите <b>«Добавить на главный экран»</b> (в Chrome — «Установить приложение»).',
        'Подтвердите — иконка появится среди приложений телефона.'
      ];
    }

    return [
      'В Chrome или Edge нажмите значок установки в адресной строке — справа от адреса.',
      'Либо откройте меню браузера и выберите <b>«Установить приложение»</b> (в Safari на Mac — «Файл» → «Добавить в Dock»).'
    ];
  }

  function renderInstallSteps() {
    els.installSteps.innerHTML = installSteps().map(function (step) {
      return '<li>' + step + '</li>';
    }).join('');
  }

  function openInstall() {
    renderInstallSteps();
    els.installModal.hidden = false;
    document.body.classList.add('has-modal');
    (els.installNative.hidden ? els.installClose : els.installNative).focus();
  }

  function closeInstall() {
    if (els.installModal.hidden) return;
    els.installModal.hidden = true;
    document.body.classList.remove('has-modal');
    els.installBtn.focus();
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    els.installNative.hidden = false;
    els.installBtn.classList.add('is-ready');
  });

  window.addEventListener('appinstalled', function () {
    installPrompt = null;
    els.installNative.hidden = true;
    els.installBtn.hidden = true;
    closeInstall();
  });

  if (standaloneQuery.addEventListener) {
    standaloneQuery.addEventListener('change', syncInstallButton);
  } else if (standaloneQuery.addListener) {
    standaloneQuery.addListener(syncInstallButton);
  }

  // ── События ──────────────────────────────────────────────────────

  els.groupSwitch.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-group]');
    if (!btn) return;
    state.group = btn.dataset.group;
    writeHash();
    render();
  });

  els.weekSwitch.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-week]');
    if (!btn) return;
    state.week = btn.dataset.week;
    state.weekAuto = false;
    writeHash();
    render();
  });

  els.autoWeek.addEventListener('click', function () {
    if (state.weekAuto) {
      state.week = currentWeek();
      state.weekAuto = false;
    } else {
      state.weekAuto = true;
    }
    writeHash();
    render();
  });

  els.tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      state.view = tab.dataset.view;
      writeHash();
      syncControls();
    });
  });

  window.addEventListener('hashchange', function () {
    readHash();
    render();
  });

  els.installBtn.addEventListener('click', openInstall);

  els.installModal.addEventListener('click', function (event) {
    if (event.target.closest('[data-install-close]')) closeInstall();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeInstall();
  });

  els.installNative.addEventListener('click', function () {
    var prompt = installPrompt;
    if (!prompt) return;

    els.installNative.hidden = true;
    installPrompt = null;
    prompt.prompt();

    var choice = prompt.userChoice;
    if (choice && typeof choice.then === 'function') {
      choice.then(function (result) {
        if (result && result.outcome === 'accepted') els.installBtn.hidden = true;
        closeInstall();
      });
    } else {
      closeInstall();
    }
  });

  // ── Старт ────────────────────────────────────────────────────────

  readHash();
  renderHeader();
  renderGroupSwitch();
  renderBells();
  renderClockTicks();
  updateClock();
  setInterval(updateClock, 1000);
  render();
  syncInstallButton();

  /* Офлайн-режим и установка работают только по http(s), не с file://. */
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
