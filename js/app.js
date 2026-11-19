/* Логика страницы: переключение группы/недели и отрисовка таблиц. */
(function () {
  'use strict';

  var DATA = window.SCHEDULE_DATA;

  var state = {
    faculty: null,
    course: null,
    group: null,
    week: 'even',
    weekAuto: true,
    view: 'schedule',
  };

  var STORAGE_KEY = 'pgtu.schedule.selection';

  var els = {
    org: document.getElementById('org'),
    title: document.getElementById('title'),
    period: document.getElementById('period'),
    groupChip: document.getElementById('group-chip'),
    changeGroup: document.getElementById('change-group'),
    scheduleControls: document.getElementById('schedule-controls'),
    scheduleWrap: document.getElementById('schedule-wrap'),
    emptyState: document.getElementById('schedule-empty'),
    emptyChoose: document.getElementById('empty-choose'),
    setupModal: document.getElementById('setup-modal'),
    setupFaculties: document.getElementById('setup-faculties'),
    setupCourses: document.getElementById('setup-courses'),
    setupGroups: document.getElementById('setup-groups'),
    setupApply: document.getElementById('setup-apply'),
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
    wheelSegments: document.getElementById('wheel-segments'),
    wheelNeedle: document.getElementById('wheel-needle'),
    wheelResult: document.getElementById('wheel-result'),
    spinWheel: document.getElementById('spin-wheel'),
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

  function facultyById(id) {
    return DATA.faculties.filter(function (f) { return f.id === id; })[0] || null;
  }

  function courseByNumber(faculty, number) {
    if (!faculty) return null;
    return faculty.courses.filter(function (c) { return c.number === number; })[0] || null;
  }

  /* Ищем факультет и курс, к которым относится группа. */
  function locateGroup(groupId) {
    for (var i = 0; i < DATA.faculties.length; i++) {
      var faculty = DATA.faculties[i];
      for (var j = 0; j < faculty.courses.length; j++) {
        if (faculty.courses[j].groups.indexOf(groupId) !== -1) {
          return { faculty: faculty, course: faculty.courses[j] };
        }
      }
    }
    return null;
  }

  function applyGroup(groupId) {
    var found = locateGroup(groupId);
    if (!found) return false;
    state.faculty = found.faculty.id;
    state.course = found.course.number;
    state.group = groupId;
    return true;
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

    if (group) applyGroup(group);

    if (week === 'auto') {
      state.weekAuto = true;
    } else if (week === 'even' || week === 'odd') {
      state.week = week;
      state.weekAuto = false;
    }
    if (view === 'schedule' || view === 'bells' || view === 'roulette') state.view = view;
  }

  function writeHash() {
    var params = new URLSearchParams();
    if (state.group) {
      params.set('faculty', state.faculty);
      params.set('course', String(state.course));
      params.set('group', state.group);
    }
    params.set('week', state.weekAuto ? 'auto' : state.week);
    params.set('view', state.view);
    history.replaceState(null, '', '#' + params.toString());
  }

  /* Выбор группы запоминается, чтобы при следующем заходе не выбирать заново. */
  function readStored() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var saved = JSON.parse(raw);
      return saved && saved.group ? applyGroup(saved.group) : false;
    } catch (error) {
      return false;
    }
  }

  function saveSelection() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        faculty: state.faculty,
        course: state.course,
        group: state.group,
      }));
    } catch (error) {
      /* приватный режим — просто не запоминаем */
    }
  }

  // ── Отрисовка ────────────────────────────────────────────────────

  function renderHeader() {
    els.org.textContent = DATA.meta.org;
    els.title.textContent = DATA.meta.title;
    els.period.textContent = DATA.meta.period;
    document.title = DATA.meta.title + ' — ' + DATA.meta.org;
  }

  function syncControls() {
    var hasGroup = !!state.group;

    if (els.scheduleControls) els.scheduleControls.hidden = !hasGroup;
    if (els.scheduleWrap) els.scheduleWrap.hidden = !hasGroup;
    if (els.emptyState) els.emptyState.hidden = hasGroup;

    if (hasGroup) {
      var faculty = facultyById(state.faculty);
      var group = groupById(state.group);
      els.groupChip.innerHTML =
        '<span class="group-chip__name">' + escapeHtml(group ? group.name : state.group) + '</span>' +
        '<span class="group-chip__meta">' + escapeHtml(faculty ? faculty.name : '') +
        ' · ' + escapeHtml(state.course) + ' курс</span>';
    }

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
    if (!state.group) {
      els.scheduleTable.innerHTML = '';
      return;
    }

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

  // ── Рулетка ─────────────────────────────────────────────────────

  var WHEEL_CX = 160;
  var WHEEL_CY = 160;
  var WHEEL_RADIUS = 150;
  var WHEEL_SPIN_MS = 4300;

  /*
   * weight — вероятность в процентах. Сумма весов должна быть 100,
   * иначе подписи на колесе разойдутся с реальными шансами.
   */
  var WHEEL_SEGMENTS = [
    {
      id: 'go',
      weight: 50,
      label: 'Идти на пару',
      lines: ['Идти', 'на пару'],
      fill: '#1b523a',
      stroke: 'rgba(134, 223, 168, 0.55)',
      text: '#dcffe9',
    },
    {
      id: 'skip',
      weight: 45,
      label: 'Не идти на пару',
      lines: ['Не идти', 'на пару'],
      fill: '#122e21',
      stroke: 'rgba(122, 196, 158, 0.45)',
      text: '#d6f3e1',
    },
    {
      id: 'home',
      weight: 5,
      label: 'Остаться дома',
      fill: '#0f7d57',
      stroke: 'rgba(87, 233, 168, 0.9)',
      text: '#d9ffef',
    },
  ];

  var wheelRotation = 0;
  var wheelSpinning = false;
  var wheelTimer = null;
  var wheelOnEnd = null;

  /* Снимаем обработчик и таймер прошлого спина, чтобы они не сработали повторно. */
  function clearWheelTimers() {
    if (wheelTimer) {
      window.clearTimeout(wheelTimer);
      wheelTimer = null;
    }
    if (wheelOnEnd) {
      els.wheelNeedle.removeEventListener('transitionend', wheelOnEnd);
      wheelOnEnd = null;
    }
  }

  function wheelPoint(angle, radius) {
    var rad = angle * Math.PI / 180;
    return {
      x: WHEEL_CX + Math.sin(rad) * radius,
      y: WHEEL_CY - Math.cos(rad) * radius,
    };
  }

  function wheelSector(start, end) {
    var a = wheelPoint(start, WHEEL_RADIUS);
    var b = wheelPoint(end, WHEEL_RADIUS);
    var large = end - start > 180 ? 1 : 0;

    return 'M' + WHEEL_CX + ' ' + WHEEL_CY +
      ' L' + a.x.toFixed(2) + ' ' + a.y.toFixed(2) +
      ' A' + WHEEL_RADIUS + ' ' + WHEEL_RADIUS + ' 0 ' + large + ' 1 ' +
      b.x.toFixed(2) + ' ' + b.y.toFixed(2) + ' Z';
  }

  function renderWheel() {
    var total = 0;
    var angle = 0;
    var markup = '';

    WHEEL_SEGMENTS.forEach(function (item) { total += item.weight; });

    WHEEL_SEGMENTS.forEach(function (item) {
      var span = item.weight / total * 360;

      item.start = angle;
      item.span = span;
      item.mid = angle + span / 2;

      markup += '<path class="roulette__segment roulette__segment--' + item.id +
        '" d="' + wheelSector(angle, angle + span) +
        '" fill="' + item.fill + '" stroke="' + item.stroke + '" />';

      /* В узкий сектор подпись не помещается — ставим звезду, остальное есть в легенде. */
      if (span >= 40) {
        var point = wheelPoint(item.mid, WHEEL_RADIUS * 0.55);
        var x = point.x.toFixed(2);
        var y = point.y.toFixed(2);

        markup += '<text class="roulette__label" x="' + x + '" y="' + y +
          '" text-anchor="middle" fill="' + item.text + '">' +
          '<tspan x="' + x + '" dy="-12">' + item.lines[0] + '</tspan>' +
          '<tspan x="' + x + '" dy="16">' + item.lines[1] + '</tspan>' +
          '<tspan class="roulette__label-sub" x="' + x + '" dy="15" fill-opacity="0.72">' +
          item.weight + '%</tspan>' +
          '</text>';
      } else {
        var star = wheelPoint(item.mid, WHEEL_RADIUS * 0.62);

        markup += '<path class="roulette__star" transform="translate(' +
          star.x.toFixed(2) + ' ' + star.y.toFixed(2) + ')" ' +
          'd="M0 -8.2L2.29 -3.16L7.8 -2.53L3.71 1.21L4.82 6.63L0 3.9' +
          'L-4.82 6.63L-3.71 1.21L-7.8 -2.53L-2.29 -3.16Z" />';
      }

      angle += span;
    });

    els.wheelSegments.innerHTML = markup;
  }

  function pickWheelSegment() {
    var total = 0;
    var roll;
    var acc = 0;
    var i;

    WHEEL_SEGMENTS.forEach(function (item) { total += item.weight; });
    roll = Math.random() * total;

    for (i = 0; i < WHEEL_SEGMENTS.length; i++) {
      acc += WHEEL_SEGMENTS[i].weight;
      if (roll < acc) return WHEEL_SEGMENTS[i];
    }

    return WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1];
  }

  function spinWheel() {
    if (wheelSpinning) return;

    var picked = pickWheelSegment();
    var turns = 5 + Math.floor(Math.random() * 2);
    var jitterLimit = Math.max(0, picked.span / 2 - 4);
    var jitter = (Math.random() * 2 - 1) * jitterLimit * 0.55;
    var current = ((wheelRotation % 360) + 360) % 360;
    var delta = ((picked.mid + jitter - current) % 360 + 360) % 360;

    clearWheelTimers();
    wheelSpinning = true;
    wheelRotation += delta + turns * 360;

    els.spinWheel.disabled = true;
    els.spinWheel.textContent = 'Крутим…';
    els.wheelResult.className = 'roulette__result';
    els.wheelResult.removeAttribute('data-tone');
    els.wheelResult.textContent = 'Колесо крутится…';

    function finish() {
      if (!wheelSpinning) return;

      clearWheelTimers();
      wheelSpinning = false;
      els.spinWheel.disabled = false;
      els.spinWheel.textContent = 'Крутить';
      els.wheelNeedle.classList.remove('is-spinning');

      els.wheelResult.className = 'roulette__result has-outcome';
      els.wheelResult.dataset.tone = picked.id;
      els.wheelResult.innerHTML =
        '<span class="roulette__result-label">' + escapeHtml(picked.label) + '</span>' +
        '<span class="roulette__result-note">Выпало с шансом ' + picked.weight + '%</span>';
    }

    wheelOnEnd = function (event) {
      if (event.propertyName !== 'transform') return;
      finish();
    };
    els.wheelNeedle.addEventListener('transitionend', wheelOnEnd);

    els.wheelNeedle.classList.add('is-spinning');
    /* Фиксируем стартовое положение, чтобы переход сработал. */
    void els.wheelNeedle.getBoundingClientRect();
    els.wheelNeedle.style.transform = 'rotate(' + wheelRotation + 'deg)';

    /* Страховка, если transitionend не придёт. */
    wheelTimer = window.setTimeout(finish, WHEEL_SPIN_MS + 300);
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

  // ── Выбор факультета, курса и группы ────────────────────────────

  var draft = { faculty: null, course: null, group: null };

  function optionHtml(kind, value, label, active) {
    return '<button class="setup__option' + (active ? ' is-active' : '') + '" type="button" ' +
      'data-' + kind + '="' + escapeHtml(value) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
      escapeHtml(label) + '</button>';
  }

  function markActive(container, kind, value) {
    Array.prototype.forEach.call(container.querySelectorAll('[data-' + kind + ']'), function (btn) {
      var on = btn.dataset[kind] === value;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function focusOption(container, kind, value) {
    var btn = container.querySelector('[data-' + kind + '="' + value + '"]');
    if (btn) btn.focus();
  }

  function renderSetup() {
    var faculty = facultyById(draft.faculty);
    if (!faculty) {
      draft.course = null;
      draft.group = null;
    }

    els.setupFaculties.innerHTML = DATA.faculties.map(function (item) {
      return optionHtml('faculty', item.id, item.name, draft.faculty === item.id);
    }).join('');

    var courses = faculty ? faculty.courses : [];
    els.setupCourses.innerHTML = courses.map(function (item) {
      return optionHtml('course', String(item.number), item.number + ' курс', draft.course === item.number);
    }).join('');

    var course = faculty ? courseByNumber(faculty, draft.course) : null;

    if (!course) {
      els.setupGroups.innerHTML = '<p class="setup__hint">Сначала выберите курс.</p>';
    } else if (!course.groups.length) {
      els.setupGroups.innerHTML = '<p class="setup__hint">На этом курсе групп пока нет — расписание появится позже.</p>';
    } else {
      els.setupGroups.innerHTML = course.groups.map(function (id) {
        var group = groupById(id);
        return optionHtml('group', id, group ? group.name : id, draft.group === id);
      }).join('');
    }

    els.setupApply.disabled = !draft.group;
  }

  function openSetup() {
    draft.faculty = state.faculty || (DATA.faculties[0] && DATA.faculties[0].id) || null;
    draft.course = state.course || null;
    draft.group = state.group || null;

    renderSetup();
    els.setupModal.hidden = false;
    document.body.classList.add('has-modal');

    var first = els.setupFaculties.querySelector('button');
    if (first) first.focus();
  }

  function closeSetup() {
    if (els.setupModal.hidden) return;
    els.setupModal.hidden = true;
    document.body.classList.remove('has-modal');
    (state.group ? els.changeGroup : els.emptyChoose).focus();
  }

  // ── События ──────────────────────────────────────────────────────

  els.changeGroup.addEventListener('click', openSetup);
  els.emptyChoose.addEventListener('click', openSetup);

  els.setupModal.addEventListener('click', function (event) {
    if (event.target.closest('[data-setup-close]')) {
      closeSetup();
      return;
    }

    var facultyBtn = event.target.closest('[data-faculty]');
    if (facultyBtn) {
      var facultyId = facultyBtn.dataset.faculty;
      if (draft.faculty !== facultyId) {
        draft.course = null;
        draft.group = null;
      }
      draft.faculty = facultyId;
      renderSetup();
      focusOption(els.setupFaculties, 'faculty', facultyId);
      return;
    }

    var courseBtn = event.target.closest('[data-course]');
    if (courseBtn) {
      var number = Number(courseBtn.dataset.course);
      var faculty = facultyById(draft.faculty);
      var course = courseByNumber(faculty, number);

      draft.course = number;
      if (!course || course.groups.indexOf(draft.group) === -1) draft.group = null;

      renderSetup();
      focusOption(els.setupCourses, 'course', String(number));
      return;
    }

    var groupBtn = event.target.closest('[data-group]');
    if (groupBtn) {
      draft.group = groupBtn.dataset.group;
      markActive(els.setupGroups, 'group', draft.group);
      els.setupApply.disabled = false;
    }
  });

  els.setupApply.addEventListener('click', function () {
    if (!draft.group) return;

    state.faculty = draft.faculty;
    state.course = draft.course;
    state.group = draft.group;

    saveSelection();
    writeHash();
    closeSetup();
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

  els.spinWheel.addEventListener('click', spinWheel);

  els.installBtn.addEventListener('click', openInstall);

  els.installModal.addEventListener('click', function (event) {
    if (event.target.closest('[data-install-close]')) closeInstall();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeInstall();
    closeSetup();
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

  /* Ссылка с группой важнее сохранённого выбора, иначе берём его. */
  if (!state.group) readStored();

  /* Пришли по короткой ссылке #group=… — запоминаем выбор и приводим адрес к полному виду. */
  if (state.group) {
    saveSelection();
    writeHash();
  }

  renderHeader();
  renderBells();
  renderClockTicks();
  renderWheel();
  updateClock();
  setInterval(updateClock, 1000);
  render();
  syncInstallButton();

  /* Первый заход без выбранной группы — сразу предлагаем выбрать. */
  if (!state.group) openSetup();

  /* Офлайн-режим и установка работают только по http(s), не с file://. */
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
