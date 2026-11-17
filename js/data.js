/*
 * Данные расписания.
 *
 * Всё, что нужно менять при обновлении расписания — этот файл.
 * Ячейки, объединённые на фото сразу на чётную и нечётную недели,
 * помечены week: 'both'.
 */
window.SCHEDULE_DATA = {
  meta: {
    org: 'ПГТУ — филиал НИУ МГСУ',
    title: 'Расписание занятий',
    period: 'Режим занятий обучающихся по образовательным программам высшего образования',
    updated: '17.11.2026',
    // Опорная неделя для автоопределения: понедельник этой недели считается чётным.
    weekRule: {
      anchorMonday: '2026-11-16',
      anchorWeek: 'odd',
    },
  },

  groups: [
    { id: 'ii-25', name: 'ИИ-25' },
    { id: 'ib-1-25', name: 'ИБ-1-25' },
    { id: 'ib-2-25', name: 'ИБ-2-25' },
  ],

  days: [
    { id: 'mon', name: 'Понедельник', short: 'Пн' },
    { id: 'tue', name: 'Вторник', short: 'Вт' },
    { id: 'wed', name: 'Среда', short: 'Ср' },
    { id: 'thu', name: 'Четверг', short: 'Чт' },
    { id: 'fri', name: 'Пятница', short: 'Пт' },
  ],

  // Учебные пары (I–V используются в расписании, но звонки есть до VIII)
  pairs: [
    { number: 1, label: 'I' },
    { number: 2, label: 'II' },
    { number: 3, label: 'III' },
    { number: 4, label: 'IV' },
    { number: 5, label: 'V' },
  ],

  // Звонки: pair — номер пары, break — перерыв
  bells: [
    { pair: 1, start: '08:30', end: '09:50' },
    { break: true, start: '09:50', end: '10:00' },
    { pair: 2, start: '10:00', end: '11:20' },
    { break: true, start: '11:20', end: '11:30' },
    { pair: 3, start: '11:30', end: '12:50' },
    { break: true, start: '12:50', end: '13:00' },
    { pair: 4, start: '13:00', end: '14:20' },
    { break: true, start: '14:20', end: '14:30' },
    { pair: 5, start: '14:30', end: '15:50' },
    { break: true, start: '15:50', end: '16:00' },
    { pair: 6, start: '16:00', end: '17:20' },
    { break: true, start: '17:20', end: '17:30' },
    { pair: 7, start: '17:30', end: '18:50' },
    { break: true, start: '18:50', end: '19:00' },
    { pair: 8, start: '19:00', end: '20:20' },
  ],

  /*
   * Занятия.
   * week: 'even' — чётная, 'odd' — нечётная, 'both' — каждая неделя.
   * groups: к каким группам относится занятие (одна пара может идти на поток).
   * type: lecture | practice | lab | coursework | pe — влияет на цветную метку.
   */
  lessons: [
    // ── Понедельник ────────────────────────────────────────────────
    {
      day: 'mon', pair: 1, week: 'both', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Физика',
      teacher: 'Тютюников', room: '5.410',
    },
    {
      day: 'mon', pair: 2, week: 'both', groups: ['ii-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Математический анализ',
      teacher: 'Безбородова', room: '5.509',
    },
    {
      day: 'mon', pair: 2, week: 'both', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '16.337',
    },
    {
      day: 'mon', pair: 3, week: 'odd', groups: ['ii-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Математический анализ',
      teacher: 'Полищук', room: '5.507',
    },
    {
      day: 'mon', pair: 4, week: 'both', groups: ['ii-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '16.337',
    },
    {
      day: 'mon', pair: 4, week: 'both', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Философия',
      teacher: 'Сусарина', room: '1Д.411',
    },
    {
      day: 'mon', pair: 5, week: 'even', groups: ['ib-2-25'],
      type: 'lab', typeLabel: 'лаб.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.214',
    },
    {
      day: 'mon', pair: 5, week: 'odd', groups: ['ii-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Философия',
      teacher: 'Сусарина', room: '2.214',
    },
    {
      day: 'mon', pair: 5, week: 'odd', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.214',
    },

    // ── Вторник ───────────────────────────────────────────────────
    {
      day: 'tue', pair: 1, week: 'even', groups: ['ii-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Компьютерная графика',
      teacher: 'Миронова', room: '5.511',
    },
    {
      day: 'tue', pair: 1, week: 'even', groups: ['ib-1-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Философия',
      teacher: 'Сусарина', room: '2.214',
    },
    {
      day: 'tue', pair: 1, week: 'odd', groups: ['ib-2-25'],
      type: 'coursework', typeLabel: 'Курсовая', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.401',
    },
    {
      day: 'tue', pair: 2, week: 'both', groups: ['ii-25', 'ib-1-25', 'ib-2-25'],
      type: 'pe', typeLabel: '', subject: 'Физическая культура',
      teacher: '', room: '',
    },
    {
      day: 'tue', pair: 3, week: 'both', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Математический анализ',
      teacher: 'Безбородова', room: '5.511',
    },
    {
      day: 'tue', pair: 4, week: 'both', groups: ['ii-25', 'ib-1-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Вычислительная математика',
      teacher: 'Гусев', room: '1Д.410',
    },
    {
      day: 'tue', pair: 4, week: 'both', groups: ['ib-2-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Математический анализ',
      teacher: 'Полищук', room: '5.511',
    },

    // ── Среда ─────────────────────────────────────────────────────
    {
      day: 'wed', pair: 1, week: 'both', groups: ['ii-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Философия',
      teacher: 'Сусарина', room: '1Д.411',
    },
    {
      day: 'wed', pair: 1, week: 'odd', groups: ['ib-1-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Дифференциальные уравнения',
      teacher: 'Тютюников', room: '5.511',
    },
    {
      day: 'wed', pair: 1, week: 'both', groups: ['ib-2-25'],
      type: 'lab', typeLabel: 'лаб.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.214',
    },
    {
      day: 'wed', pair: 2, week: 'even', groups: ['ii-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Дифференциальные уравнения',
      teacher: 'Тютюников', room: '5.511',
    },
    {
      day: 'wed', pair: 2, week: 'both', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Дифференциальные уравнения',
      teacher: 'Анищенко', room: '5.507',
    },
    {
      day: 'wed', pair: 4, week: 'both', groups: ['ii-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Вычислительная математика',
      teacher: 'Гусев', room: '1Д.403',
    },
    {
      day: 'wed', pair: 4, week: 'odd', groups: ['ib-2-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Дифференциальные уравнения',
      teacher: 'Тютюников', room: '5.511',
    },
    {
      day: 'wed', pair: 5, week: 'both', groups: ['ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Вычислительная математика',
      teacher: 'Гусев', room: '5.337',
    },

    // ── Четверг ───────────────────────────────────────────────────
    {
      day: 'thu', pair: 1, week: 'both', groups: ['ii-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Физика',
      teacher: 'Тютюников', room: '5.509',
    },
    {
      day: 'thu', pair: 1, week: 'even', groups: ['ib-1-25'],
      type: 'coursework', typeLabel: 'Курсовая', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.401',
    },
    {
      day: 'thu', pair: 1, week: 'odd', groups: ['ib-1-25'],
      type: 'lab', typeLabel: 'лаб.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.214',
    },
    {
      day: 'thu', pair: 1, week: 'odd', groups: ['ib-2-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Философия',
      teacher: 'Сусарина', room: '2.214',
    },
    {
      day: 'thu', pair: 2, week: 'even', groups: ['ii-25', 'ib-1-25', 'ib-2-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Основы военной подготовки',
      teacher: 'Цараков', room: '1А.417',
    },
    {
      day: 'thu', pair: 2, week: 'odd', groups: ['ii-25', 'ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Основы военной подготовки',
      teacher: 'Пивень', room: '1А.417',
    },
    {
      day: 'thu', pair: 3, week: 'both', groups: ['ii-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Дифференциальные уравнения',
      teacher: 'Анищенко', room: '5.509',
    },
    {
      day: 'thu', pair: 3, week: 'both', groups: ['ib-1-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Физика',
      teacher: 'Эрнесто Кампано Вега', room: '5.422',
    },
    {
      day: 'thu', pair: 3, week: 'both', groups: ['ib-2-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Вычислительная математика',
      teacher: 'Безбородова', room: '5.522',
    },
    {
      day: 'thu', pair: 4, week: 'even', groups: ['ii-25'],
      type: 'practice', typeLabel: 'Пр+коп.', subject: 'Компьютерная графика',
      teacher: 'Туровник', room: '5.210',
    },
    {
      day: 'thu', pair: 4, week: 'odd', groups: ['ii-25'],
      type: 'coursework', typeLabel: 'Курсовая', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.401',
    },
    {
      day: 'thu', pair: 4, week: 'both', groups: ['ib-2-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Физика',
      teacher: 'Эрнесто Кампано Вега', room: '5.422',
    },
    {
      day: 'thu', pair: 5, week: 'both', groups: ['ib-1-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Математический анализ',
      teacher: 'Полищук', room: '5.507',
    },

    // ── Пятница ───────────────────────────────────────────────────
    {
      day: 'fri', pair: 1, week: 'even', groups: ['ii-25'],
      type: 'lab', typeLabel: 'лаб+коп.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.214',
    },
    {
      day: 'fri', pair: 1, week: 'even', groups: ['ib-1-25', 'ib-2-25'],
      type: 'lecture', typeLabel: 'Лек.', subject: 'Компьютерная графика',
      teacher: 'Миронова', room: '5.509',
    },
    {
      day: 'fri', pair: 2, week: 'even', groups: ['ib-2-25'],
      type: 'practice', typeLabel: 'Пр+коп.', subject: 'Компьютерная графика',
      teacher: 'Туровник', room: '5.214',
    },
    {
      day: 'fri', pair: 2, week: 'odd', groups: ['ib-1-25'],
      type: 'practice', typeLabel: 'Пр+коп.', subject: 'Компьютерная графика',
      teacher: 'Туровник', room: '5.214',
    },
    {
      day: 'fri', pair: 3, week: 'both', groups: ['ii-25'],
      type: 'practice', typeLabel: 'пр/лр.', subject: 'Физика',
      teacher: 'Эрнесто Кампано Вега', room: '5.422',
    },
    {
      day: 'fri', pair: 3, week: 'both', groups: ['ib-1-25'],
      type: 'practice', typeLabel: 'пр.', subject: 'Вычислительная математика',
      teacher: 'Безбородова', room: '5.511',
    },
    {
      day: 'fri', pair: 4, week: 'both', groups: ['ib-1-25'],
      type: 'lab', typeLabel: 'лаб.', subject: 'Физика',
      teacher: 'Эрнесто Кампано Вега', room: '5.422',
    },
    {
      day: 'fri', pair: 5, week: 'both', groups: ['ib-1-25'],
      type: 'lab', typeLabel: 'лаб.', subject: 'Алгоритмизация и программирование',
      teacher: 'Лифшиц', room: '5.214',
    },
    {
      day: 'fri', pair: 5, week: 'both', groups: ['ib-2-25'],
      type: 'lab', typeLabel: 'лаб.', subject: 'Физика',
      teacher: 'Эрнесто Кампано Вега', room: '5.422',
    },
  ],
};
