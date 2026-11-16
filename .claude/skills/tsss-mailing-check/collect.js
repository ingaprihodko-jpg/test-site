// Сбор данных рассылок tsss.site. Только чтение: ничего не сохраняет и не нажимает.
// Вставить целиком через javascript_tool на ЛЮБОЙ открытой странице tsss.site,
// затем: tsssCollect([id1, id2, ...])  — запускает сбор в фоне (не ждать: CDP таймаут 45 с)
//        await tsssWait()               — ждёт окончания (до 40 с за вызов, вызывать повторно)
//        tsssReport(id)                 — массив коротких строк по одной рассылке
//        tsssSegDiff(idA, idB)          — разница условий сегментов
//        await tsssFind('БАЛЛЫ [24.10.26')  — id рассылок, в названии которых есть подстрока
// Не уходить со страницы во время работы: window.__tsss живёт только в этой вкладке.

window.__tsssExtract = `async () => {
  const q = s => document.querySelector(s);
  const val = e => e.type === 'checkbox' || e.type === 'radio' ? (e.checked ? e.value : null)
    : e.tagName === 'SELECT' ? [...e.selectedOptions].map(o => o.text).join(', ') : e.value;
  const fields = d => { const o = {};
    d.querySelectorAll('input,select,textarea').forEach(e => {
      if (!e.name || /csrf|summernote|^r\\d+$/.test(e.name) || e.name === 'rule') return;
      const v = val(e); if (v == null || v === '') return;
      o[e.name] = o[e.name] ? o[e.name] + ' | ' + v : String(v).slice(0, 500); });
    return o; };
  const optName = id => { const o = document.querySelector('option[value="' + id + '"]'); return o ? o.text : null; };
  const cache = {};
  async function offerName(id) {
    if (cache[id]) return cache[id];
    try { const h = await (await fetch('/pl/sales/offer/update?id=' + id)).text();
      const d = new DOMParser().parseFromString(h, 'text/html');
      cache[id] = d.querySelector('[name="Offer[title]"]')?.value || d.title; } catch (e) { cache[id] = '?'; }
    return cache[id]; }
  async function rule(r, d) {
    const p = r.params || {}, ind = '  '.repeat(d), neg = r.inverted ? 'НЕ ' : '';
    const extra = { ...p }; delete extra.children; delete extra.linkedRule;
    let txt = JSON.stringify(extra);
    const ids = p.value?.selected_id;
    if (ids && ids.length && r.type === 'deal_offer_id') txt += ' => ' + (await Promise.all([].concat(ids).map(offerName))).join('; ');
    else if (ids && ids.length) txt += ' => ' + [].concat(ids).map(i => optName(i) || i).join('; ');
    const out = [ind + neg + r.type + ' ' + txt];
    if (p.linkedRule) out.push(ind + '  [в заказе/продукте:]', await rule(p.linkedRule, d + 2));
    for (const k of p.children || []) out.push(await rule(k, d + 1));
    return out.join('\\n'); }
  const main = fields(document);
  const ruleEl = q('[name=rule]');
  const segment = ruleEl && ruleEl.value ? await rule(JSON.parse(ruleEl.value), 0) : '(нет условий)';
  const body = q('#mainForm .col-md-8') || q('.main-page-block');
  const links = [...body.querySelectorAll('a')].filter(a => !/messages\\/|getcourse\\.ru\\/help|var_support|javascript:/.test(a.href) && !/Анализ текста/.test(a.innerText)).map(a => {
    try { const u = new URL(a.href);
      const utm = [...u.searchParams].filter(([k]) => k.startsWith('utm')).map(([k, v]) => k.replace('utm_', '') + ':' + v).join(' ');
      return '«' + a.innerText.trim().slice(0, 50) + '» ' + (u.protocol === 'mailto:' ? a.href : u.host + u.pathname) + (utm ? ' [' + utm + ']' : ' [без UTM]'); }
    catch (e) { return a.href; } });
  const imgs = [...body.querySelectorAll('img')].map(i => i.src.replace(/\\?.*/, '').split('/').slice(-4).join('/') + (i.alt ? ' alt:' + i.alt : ''));
  const files = [...document.querySelectorAll('a[href*="fileindex/file/view"]')].map(a => a.innerText.trim());
  const sh = await (await fetch(location.pathname.replace(/part\\/\\w+/, 'part/settings'))).text();
  const settings = fields(new DOMParser().parseFromString(sh, 'text/html'));
  const status = (document.body.innerText.match(/Состояние\\s+(.+)/) || [])[1];
  const content = q('.notification-message-content') || body;
  return { title: document.title, status, main, settings, segment, links, imgs, files,
    editable: !!document.querySelector('.note-editable, [contenteditable=true]'),
    text: content.innerText.replace(/\\n{3,}/g, '\\n\\n') };
}`;

window.__tsss = window.__tsss || {};
window.__tsssBusy = false;

window.tsssCollect = (ids) => {
  window.__tsssBusy = true;
  const load = id => new Promise(res => {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-5000px;width:1200px;height:800px';
    f.src = '/notifications/control/mailings/update/id/' + id + '/part/main';
    const t = setTimeout(() => { f.remove(); res({ error: 'timeout' }); }, 40000);
    f.onload = async () => {
      const w = f.contentWindow;
      for (let i = 0; i < 30; i++) {
        const r = w.document.querySelector('[name=rule]');
        if (w.document.readyState === 'complete' && (!r || r.value || i > 12)) break;
        await new Promise(z => setTimeout(z, 300));
      }
      try { res(await w.eval('(' + window.__tsssExtract + ')')()); } catch (e) { res({ error: String(e) }); }
      clearTimeout(t); f.remove();
    };
    document.body.appendChild(f);
  });
  (async () => { for (const id of ids) window.__tsss[id] = await load(id); window.__tsssBusy = false; })();
  return 'started ' + ids.length;
};

window.tsssWait = async () => {
  for (let i = 0; i < 38 && window.__tsssBusy; i++) await new Promise(r => setTimeout(r, 1000));
  return (window.__tsssBusy ? 'ещё идёт, ' : 'готово, ') + Object.keys(window.__tsss).length + ' шт.';
};

// Вывод без ?, & и = — иначе инструмент блокирует ответ как «query string».
window.tsssSan = s => String(s).replace(/[?&]/g, ' ').replace(/=/g, ':');
window.tsssClean = s => s
  .replace(/"selected_id":\[\],|,?"all_object_with_tags":(true|false)|,?"valueMode":null|,?"countCondition":null/g, '')
  .replace(/,?"(toNDays|fromNDays|dateType)":null|,?"withTime":false|"events":\{"selected_id":null\},?/g, '')
  .replace(/"created_at":\{"from":null,"to":null\},?/g, '')
  .replace(/[{}"]/g, '').replace(/value:/g, '').replace(/\(20\d\d-\d\d-\d\d [^)]+\)/g, '');

window.tsssReport = (id, withText) => {
  const r = window.__tsss[id]; if (!r) return ['нет данных ' + id];
  if (r.error) return [id + ' ОШИБКА ' + r.error];
  const m = r.main;
  const out = [
    id + ' ' + r.title, 'статус: ' + r.status + ' | редактируемая: ' + r.editable,
    'отправка: ' + m['Mailing[need_send_at]'] + ' (' + m['Mailing[schedule_type]'] + ')',
    'кому: ' + m['ParamsObject[recipients_type]'] + ' | send_to: ' + (m['ParamsObject[send_to]'] || '-') + ' | бот: ' + (m['ParamsObject[telegram_bot_id]'] || '-'),
    'от: ' + r.settings['Mailing[sendFrom]'] + ' | тема: ' + (r.settings['Mailing[subject]'] || '-'),
    'теги: ' + m['Mailing[tags][]'],
    'ссылки: ' + (r.links.join(' ;; ') || '—'),
    'картинки: ' + (r.imgs.join(' ;; ') || '—') + ' | файлы: ' + (r.files.join(', ') || '—'),
    'СЕГМЕНТ:', ...tsssClean(r.segment).split('\n'),
  ];
  if (withText) out.push('ТЕКСТ:', ...r.text.split('\n').filter(x => x.trim()));
  return out.map(tsssSan);
};

window.tsssSegDiff = (a, b) => {
  const L = id => tsssClean(window.__tsss[id].segment).split('\n').map(x => x.trim());
  const A = L(a), B = L(b);
  return [...B.filter(x => !A.includes(x)).map(x => '+ ' + x), ...A.filter(x => !B.includes(x)).map(x => '- ' + x)].map(tsssSan);
};

window.tsssFind = async (needle) => {
  const h = await (await fetch('/notifications/control/mailings/index')).text();
  const d = new DOMParser().parseFromString(h, 'text/html');
  const seen = {};
  [...d.querySelectorAll('a')].forEach(a => {
    const id = (a.getAttribute('href') || '').match(/mailings\/update(?:\/id\/|.*[?&]id=)(\d+)/)?.[1];
    const t = a.innerText.trim();
    if (id && t && !/^\d+$/.test(t) && t.toLowerCase().includes(needle.toLowerCase())) seen[id] = t;
  });
  return Object.entries(seen).map(([id, t]) => id + ' ' + t);
};

'tsss collect.js загружен';
