/**
 * Билеты розыгрыша → доп. поле пользователя GetCourse.
 *
 * Процесс GC по заказам (блок «Вызвать URL») дёргает этот скрипт при каждом
 * нулевом заказе. Скрипт копит номера заказов по email в этой таблице,
 * а триггер раз в минуту записывает в доп. поле полный список: «10234, 10518, 11002».
 *
 * ДГК (psyclassfze.com): процесс шлёт по каждому заказу ?dgk=1&email=…&number=<номер заказа>&add=<билетов>
 * (или ?dgk=1&email=…&count=<всего>). Скрипт складывает билеты по человеку, повтор заказа не задваивает.
 * Скрипт пишет в основном аккаунте в FIELD_DGK, сколько из них ещё не выдано (всего − выдано).
 * Процесс «Розыгрыш / 11 26 /» по перенесённому заказу выдаёт столько билетов, обнуляет поле
 * и шлёт ?dgkdone=1&email=… — скрипт считает выданным то, что было в поле.
 */

const GC_DOMAIN = 'iscelenie-course.ru';
const GC_KEY = 'ВСТАВЬТЕ_СЮДА_API_КЛЮЧ';          // GC → Профиль → Настройки аккаунта → API
const SECRET = 'ПРИДУМАЙТЕ_СЕКРЕТНОЕ_СЛОВО';       // то же слово в URL процесса
const FIELD = 'Номера_билетов_на_розыгрыш';         // название доп. поля один в один
const FIELD_DGK = 'Билет_на_розыгрыш_кол-во_ДГК';   // основной аккаунт: сколько билетов из ДГК ещё не выдано

function doGet(e) {
  const p = e.parameter || {};

  // Блок в кабинете GC: ?tickets=1&email=<email ученика>&callback=<функция> — номера билетов (JSONP).
  if (p.tickets === '1') return ticketsJsonp(p.email, p.callback);

  if (p.secret !== SECRET) return out('forbidden');

  // Служебно: ?secret=...&setup=1 — создать триггер и сразу отправить неотправленное.
  if (p.setup === '1') {
    setupTrigger();
    syncPending();
    return out('setup ok, triggers: ' + ScriptApp.getProjectTriggers().length);
  }

  if (p.dgk === '1' && p.add) return dgkOrder(p.email, p.number, p.add);
  if (p.dgk === '1') return dgkCount(p.email, p.count);
  if (p.dgkdone === '1') return dgkDone(p.email);

  const email = String(p.email || '').trim().toLowerCase();
  const number = String(p.number || '').trim();
  if (!email || !number) return out('no email or number');

  // Быстро записываем билет и сразу отвечаем GC (у него таймаут 10 секунд).
  // В доп. поле номера отправляет syncPending по триггеру раз в минуту.
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    const exists = rows.some(r => r[0] === email && String(r[1]) === number);
    if (!exists) sheet.appendRow([email, number, new Date(), '']);
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

/* Лист «ДГК»: A email | B всего в ДГК | C выдано в основном | D сейчас в поле | E обновлено | F ответ GC.
   В поле должно стоять B − C; syncDgk дописывает, если D отличается. */

/** ДГК прислал общее число билетов человека. */
function dgkCount(email, count) {
  email = String(email || '').trim().toLowerCase();
  const total = parseInt(String(count || '').replace(/\s/g, ''), 10);
  if (!email || !(total >= 0)) return out('no email or count');
  return withDgkRow(email, (row) => {
    if (!row) return [email, total, 0, 0, new Date(), ''];
    if (total > Number(row[1] || 0)) { row[1] = total; row[4] = new Date(); }
    return row;
  });
}

/** ДГК прислал заказ: сколько билетов он даёт. Лист «ДГК заказы» хранит заказы, итог идёт в лист «ДГК». */
function dgkOrder(email, number, add) {
  email = String(email || '').trim().toLowerCase();
  number = String(number || '').trim();
  const n = parseInt(String(add || ''), 10);
  if (!email || !number || !(n > 0)) return out('no email, number or add');

  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  let total;
  try {
    const sheet = getDgkOrdersSheet();
    const rows = sheet.getDataRange().getValues();
    if (!rows.some((r, k) => k > 0 && String(r[1]) === number)) {
      sheet.appendRow([email, number, n, new Date()]);
      rows.push([email, number, n]);
    }
    total = rows.filter((r, k) => k > 0 && r[0] === email).reduce((s, r) => s + Number(r[2] || 0), 0);
  } finally {
    lock.releaseLock();
  }
  return dgkCount(email, total);
}

/** Процесс основного аккаунта выдал билеты по полю и обнулил его. */
function dgkDone(email) {
  email = String(email || '').trim().toLowerCase();
  if (!email) return out('no email');
  return withDgkRow(email, (row) => {
    if (!row) return null;
    row[2] = Number(row[2] || 0) + Number(row[3] || 0);
    row[3] = 0;
    row[4] = new Date();
    return row;
  });
}

function withDgkRow(email, change) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const sheet = getDgkSheet();
    const rows = sheet.getDataRange().getValues();
    const i = rows.findIndex((r, k) => k > 0 && r[0] === email);
    const row = change(i === -1 ? null : rows[i].slice(0, 6));
    if (!row) return out('unknown email');
    if (i === -1) sheet.appendRow(row);
    else sheet.getRange(i + 1, 1, 1, 6).setValues([row]);
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

/** Раз в минуту: привести поле FIELD_DGK в основном аккаунте к «всего − выдано». */
function syncDgk() {
  const sheet = getDgkSheet();
  const rows = sheet.getDataRange().getValues();
  rows.forEach((r, i) => {
    if (i === 0 || !r[0]) return;
    const want = Math.max(0, Number(r[1] || 0) - Number(r[2] || 0));
    if (want === Number(r[3] || 0)) return;
    const res = updateGcField(r[0], FIELD_DGK, want);
    let ok = false;
    try { const j = JSON.parse(res); ok = !!(j.success && j.result && j.result.success); } catch (err) {}
    if (ok) sheet.getRange(i + 1, 4, 1, 3).setValues([[want, new Date(), 'записано ' + want]]);
    else sheet.getRange(i + 1, 6).setValue(String(res).slice(0, 200));
  });
}

/** Раз в минуту: отправить в GC поле всем, у кого есть неотправленные билеты (колонка D пустая). */
function syncPending() {
  syncDgk();
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const pending = new Set();
  rows.forEach((r, i) => { if (i > 0 && r[0] && !r[3]) pending.add(r[0]); });
  pending.forEach(email => {
    const res = updateGc(email, numbersFor(email));
    let ok = false;
    try { const j = JSON.parse(res); ok = !!(j.success && j.result && j.result.success); } catch (err) {}
    rows.forEach((r, i) => {
      if (i > 0 && r[0] === email && !r[3]) sheet.getRange(i + 1, 4).setValue(ok ? 'отправлено' : '');
    });
    if (!ok) Logger.log(email + ': ' + res);
  });
}

/** Запустить один раз вручную: создаёт триггер syncPending раз в минуту. */
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncPending').timeBased().everyMinutes(1).create();
}

/** Перезаписать поле всем, кто есть в таблице (например, после ручной вставки старых заказов). */
function syncAll() {
  const emails = new Set(getSheet().getDataRange().getValues().slice(1).map(r => r[0]).filter(Boolean));
  emails.forEach(email => Logger.log(email + ': ' + updateGc(email, numbersFor(email))));
}

function ticketsJsonp(email, callback) {
  email = String(email || '').trim().toLowerCase();
  const nums = !email ? [] : getSheet().getDataRange().getValues()
    .filter((r, i) => i > 0 && r[0] === email)
    .map(r => String(r[1]));
  const cb = /^[A-Za-z_$][\w$]*$/.test(callback || '') ? callback : 'callback';
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(nums) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function numbersFor(email) {
  return getSheet().getDataRange().getValues()
    .filter(r => r[0] === email)
    .map(r => String(r[1]))
    .join(', ');
}

function updateGc(email, value) {
  return updateGcField(email, FIELD, value);
}

function updateGcField(email, field, value) {
  const params = {
    user: { email: email, addfields: { [field]: value } },
    system: { refresh_if_exists: 1 }
  };
  const res = UrlFetchApp.fetch('https://' + GC_DOMAIN + '/pl/api/users', {
    method: 'post',
    payload: {
      action: 'add',
      key: GC_KEY,
      params: Utilities.base64Encode(JSON.stringify(params), Utilities.Charset.UTF_8)
    },
    muteHttpExceptions: true
  });
  return res.getContentText();
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Билеты');
  if (!sheet) {
    sheet = ss.insertSheet('Билеты');
    sheet.appendRow(['email', 'номер заказа', 'дата', 'в GC']);
  }
  return sheet;
}

function getDgkOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('ДГК заказы');
  if (!sheet) {
    sheet = ss.insertSheet('ДГК заказы');
    sheet.appendRow(['email', 'заказ ДГК', 'билетов', 'дата']);
  }
  return sheet;
}

function getDgkSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('ДГК');
  if (!sheet) {
    sheet = ss.insertSheet('ДГК');
    sheet.appendRow(['email', 'всего билетов в ДГК', 'выдано в основном', 'сейчас в поле', 'обновлено', 'ответ GC']);
  }
  return sheet;
}

function out(text) {
  return ContentService.createTextOutput(text);
}
