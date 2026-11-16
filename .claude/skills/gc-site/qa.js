// Проверка страницы: вставить целиком в javascript_tool на каждой ширине.
// Необязательно: window.__QA_ROOT='.f5-root' — проверять только эту часть страницы.
(() => {
  const rootSel = window.__QA_ROOT || 'body';
  const root = document.querySelector(rootSel);
  if (!root) return JSON.stringify({ error: 'Не найден ' + rootSel });

  // innerWidth на эмуляции телефона растягивается под широкий контент, clientWidth — нет
  const W = document.documentElement.clientWidth;
  const mobile = W < 768;
  const issues = [];
  const add = (level, rule, where, detail) => issues.push({ level, rule, where, detail });
  const clip = (s, n = 60) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const css = (e) => getComputedStyle(e);
  const visible = (e) => {
    const s = css(e);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const HANG = new Set(('в во с со к ко о об от у а и я до за из на не ни но по при для без над под про через между ' +
    'что чтобы если когда или же ли бы то ты он она оно мы вы они это как так да').split(' '));
  const BLOCK = new Set(['block', 'list-item', 'flex', 'grid', 'table-cell', 'flow-root', 'inline-block']);

  // Видимые текстовые узлы
  const nodes = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (tw.nextNode()) {
    const n = tw.currentNode;
    const p = n.parentElement;
    if (!n.textContent.trim() || !p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(p.tagName)) continue;
    if (p.closest('svg') || !visible(p)) continue;
    nodes.push(n);
  }
  const blockOf = (e) => {
    while (e && e !== root && !BLOCK.has(css(e).display)) e = e.parentElement;
    return e || root;
  };

  // --- Шрифты
  const fonts = {}, sizes = {};
  const smallSeen = new Set();
  nodes.forEach((n) => {
    const p = n.parentElement, s = css(p), len = n.textContent.trim().length;
    const f = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    fonts[f] = (fonts[f] || 0) + len;
    const fs = Math.round(parseFloat(s.fontSize));
    sizes[fs] = (sizes[fs] || 0) + 1;
    if (s.fontStyle === 'italic') add('error', 'курсив', clip(p.textContent), 'Курсив на странице запрещён');
    if (fs < 13 && !smallSeen.has(fs)) {
      smallSeen.add(fs);
      add('warn', 'мелкий текст', clip(p.textContent), fs + 'px');
    }
  });
  const fontList = Object.keys(fonts);
  if (fontList.length > 2) add('error', 'больше 2 шрифтов', fontList.join(', '), JSON.stringify(fonts));
  if (Object.keys(sizes).length > 9) add('warn', 'много размеров шрифта', Object.keys(sizes).join(', ') + ' px', 'Проверить разовые размеры');

  // --- Висячие слова: смотрим настоящие переносы строк
  const byBlock = new Map();
  nodes.forEach((n) => {
    const b = blockOf(n.parentElement);
    if (!byBlock.has(b)) byBlock.set(b, []);
    byBlock.get(b).push(n);
  });
  byBlock.forEach((list, b) => {
    const words = [];
    list.forEach((n) => {
      const re = /[^\s ]+/g;
      let m;
      while ((m = re.exec(n.textContent))) {
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        const rects = r.getClientRects();
        if (rects.length) {
          // Слово с дефисом может занять две строки: считаем его по первой
          words.push({ t: m[0], top: rects[0].top, h: rects[0].height });
        }
      }
    });
    if (words.length < 2) return;
    const lines = [];
    words.forEach((w) => {
      const line = lines[lines.length - 1];
      if (line && Math.abs(line[0].top - w.top) < w.h * 0.6) line.push(w);
      else lines.push([w]);
    });
    if (lines.length < 2) return;
    lines.slice(0, -1).forEach((line) => {
      const last = line[line.length - 1].t;
      if (/[,.:;!?»)"]$/.test(last)) return;
      const w = last.replace(/^[«"(„]+/, '').toLowerCase();
      if (HANG.has(w)) add('error', 'висячий предлог', clip(b.textContent), '«' + line[line.length - 1].t + '» в конце строки');
    });
    const heading = /^H[1-3]$/.test(b.tagName);
    if (!heading && words.length > 2 && lines[lines.length - 1].length === 1 && lines[lines.length - 1][0].t.length < 16) {
      add('error', 'одно слово на строке', clip(b.textContent), '«' + lines[lines.length - 1][0].t + '»');
    }
  });

  // --- Знаки
  root.querySelectorAll('h1,h2,h3,button,a').forEach((e) => {
    if (!visible(e)) return;
    const t = e.textContent.trim();
    const isBtn = e.tagName === 'BUTTON' || (e.tagName === 'A' && css(e).backgroundImage !== 'none');
    if ((/^H/.test(e.tagName) || isBtn) && /[^.]\.$/.test(t)) add('error', 'точка в заголовке', clip(t), e.tagName);
  });
  nodes.forEach((n) => {
    const t = n.textContent;
    if (/["„“”]/.test(t)) add('warn', 'кавычки', clip(t), 'Нужны «ёлочки»');
    if (/[а-яё»)"] [-–] [а-яё«("]/i.test(t) || /[а-яё] -$/i.test(t)) add('error', 'дефис вместо тире', clip(t), 'Нужно «—»');
  });
  root.querySelectorAll('p br, li br').forEach((e) => {
    if (visible(e.parentElement) && css(e).display !== 'none') add('warn', 'перенос внутри абзаца', clip(e.parentElement.textContent), '<br>');
  });

  // --- Выравнивание
  const textLeft = (e) => {
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) {
        const r = document.createRange();
        r.selectNodeContents(walker.currentNode);
        const c = r.getClientRects()[0];
        if (c) return c.left;
      }
    }
    return null;
  };
  const h2s = [...root.querySelectorAll('h2')].filter(visible);
  const aligns = {};
  h2s.forEach((h) => {
    let a = css(h).textAlign;
    if (a === 'start' || a === 'justify') a = 'left';
    (aligns[a] = aligns[a] || []).push(clip(h.textContent, 30));
  });
  if (Object.keys(aligns).length > 1) add('error', 'разнобой в заголовках', Object.keys(aligns).join(' / '), JSON.stringify(aligns));

  const lefts = [];
  [...root.querySelectorAll('h1,h2')].filter(visible).forEach((h) => {
    const a = css(h).textAlign;
    if (a === 'center' || a === 'right') return;
    const l = textLeft(h);
    if (l !== null) lefts.push({ l: Math.round(l), t: clip(h.textContent, 30) });
  });
  if (lefts.length > 1) {
    const counts = {};
    lefts.forEach((x) => { counts[x.l] = (counts[x.l] || 0) + 1; });
    const main = +Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    lefts.filter((x) => Math.abs(x.l - main) > 2).forEach((x) =>
      add('error', 'левый край', x.t, 'Текст с ' + x.l + 'px, у остальных ' + main + 'px'));
  }

  // --- Отступы
  const contentBox = (s) => {
    let top = Infinity, bottom = -Infinity;
    s.querySelectorAll('h1,h2,h3,h4,p,li,a,button,img,picture,video,svg,table').forEach((e) => {
      if (!visible(e)) return;
      const r = e.getBoundingClientRect();
      top = Math.min(top, r.top);
      bottom = Math.max(bottom, r.bottom);
    });
    return top === Infinity ? null : { top, bottom };
  };
  let sections = [...root.querySelectorAll('section')].filter(visible);
  if (sections.length < 2) sections = [...root.children].filter((e) => visible(e) && e.getBoundingClientRect().height > 40);
  const gaps = [];
  const maxGap = mobile ? 48 : 112;
  for (let i = 0; i < sections.length - 1; i++) {
    const a = contentBox(sections[i]), b = contentBox(sections[i + 1]);
    if (!a || !b) continue;
    const gap = Math.round(b.top - a.bottom);
    gaps.push(gap);
    if (gap > maxGap + 4) add('warn', 'большой пробел между блоками', clip(sections[i + 1].textContent, 40), gap + 'px, норма до ' + maxGap + 'px');
  }
  const headGaps = [];
  h2s.forEach((h) => {
    let n = h.nextElementSibling;
    while (n && !visible(n)) n = n.nextElementSibling;
    if (!n) return;
    headGaps.push({ g: Math.round(n.getBoundingClientRect().top - h.getBoundingClientRect().bottom), t: clip(h.textContent, 30) });
  });
  if (headGaps.length > 2) {
    const sorted = headGaps.map((x) => x.g).sort((a, b) => a - b);
    const med = sorted[sorted.length >> 1];
    headGaps.filter((x) => Math.abs(x.g - med) > 12).forEach((x) =>
      add('warn', 'отступ под заголовком', x.t, x.g + 'px, у остальных около ' + med + 'px'));
  }

  // --- Кнопки
  const scrollY = window.scrollY;
  const buttons = [...root.querySelectorAll('a,button,input[type=submit]')].filter((e) => {
    if (!visible(e)) return false;
    const s = css(e);
    const painted = s.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
    return painted && e.getBoundingClientRect().height >= 32;
  });
  const heights = {};
  buttons.forEach((b) => {
    const r = b.getBoundingClientRect();
    const h = Math.round(r.height);
    (heights[h] = heights[h] || []).push(clip(b.textContent, 24));
    if (!mobile && r.width > Math.min(W * 0.6, 700)) add('warn', 'кнопка на всю ширину', clip(b.textContent, 30), Math.round(r.width) + 'px');
    b.scrollIntoView({ block: 'center', behavior: 'instant' });
    const q = b.getBoundingClientRect();
    const top = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
    if (top && top !== b && !b.contains(top) && !top.contains(b)) {
      add('error', 'кнопку перекрывает другой элемент', clip(b.textContent, 30), top.tagName + '.' + clip(String(top.className), 40));
    }
  });
  window.scrollTo({ top: scrollY, behavior: 'instant' });
  if (Object.keys(heights).length > 3) add('warn', 'разные размеры кнопок', Object.keys(heights).join(', ') + ' px', JSON.stringify(heights));

  // --- Картинки и ширина
  if (document.documentElement.scrollWidth > W + 1) add('error', 'горизонтальная прокрутка', 'страница', document.documentElement.scrollWidth + 'px при ширине ' + W + 'px');
  [...root.querySelectorAll('*')].forEach((e) => {
    if (!visible(e) || e.closest('svg')) return;
    const r = e.getBoundingClientRect();
    if (r.right <= W + 1 || r.width < 2) return;
    if (e.children.length) return;
    let a = e.parentElement, cut = false;
    while (a && a !== document.documentElement) {
      if (css(a).overflowX !== 'visible') { cut = true; break; }
      a = a.parentElement;
    }
    if (!cut) add('error', 'выходит за экран', clip(e.textContent || e.tagName), 'правый край ' + Math.round(r.right) + 'px');
  });
  const imgs = [...root.querySelectorAll('img')].filter(visible);
  imgs.forEach((im) => {
    if (im.complete && !im.naturalWidth) add('error', 'картинка не загрузилась', clip(im.getAttribute('src'), 80), '');
  });
  const textBlocks = [...byBlock.keys()];
  imgs.filter((im) => im.getBoundingClientRect().width > 80).forEach((im) => {
    const a = im.getBoundingClientRect();
    textBlocks.forEach((b) => {
      if (b.contains(im) || im.contains(b)) return;
      const list = byBlock.get(b);
      list.forEach((n) => {
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const c of r.getClientRects()) {
          const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
          const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (ox > 4 && oy > 4) {
            add('warn', 'картинка наезжает на текст', clip(b.textContent, 40), clip(im.getAttribute('src'), 50));
            return;
          }
        }
      });
    });
  });

  // --- Скрытое и GetCourse
  let hidden = 0, hiddenEx = '';
  byBlock.forEach((_, b) => {
    let e = b;
    while (e && e !== document.documentElement) {
      if (parseFloat(css(e).opacity) < 0.05) {
        hidden++;
        hiddenEx = hiddenEx || clip(b.textContent, 40);
        break;
      }
      e = e.parentElement;
    }
  });
  if (hidden) add('warn', 'скрытый текст', hiddenEx, hidden + ' блоков с прозрачностью 0. На GC так выглядит сломанное появление при прокрутке');
  const rootFont = parseFloat(css(document.documentElement).fontSize);
  if (rootFont !== 16) {
    const usesRem = [...root.querySelectorAll('style')].concat([...document.querySelectorAll('.lt-raw-html style')])
      .some((s) => /\d\s*rem\b/.test(s.textContent));
    if (usesRem) add('error', 'rem на GetCourse', 'стили страницы', 'Корневой шрифт ' + rootFont + 'px, значения в rem будут меньше задуманного');
  }

  // --- Цвета: зелёный и жёлтый запрещены, остальные показываем списком
  const colors = {};
  const seenBad = new Set();
  const hue = (c) => {
    const m = c.match(/[\d.]+/g);
    if (!m || (m[3] !== undefined && +m[3] < 0.1)) return null;
    const [r, g, b] = m.slice(0, 3).map((x) => +x / 255);
    const hex = '#' + m.slice(0, 3).map((x) => (+x | 0).toString(16).padStart(2, '0')).join('');
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    const l = (max + min) / 2, s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d) h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    return { hex, h: (h + 360) % 360, s };
  };
  [...root.querySelectorAll('*')].concat(root).forEach((e) => {
    if (!visible(e) || e.closest('svg')) return;
    const s = css(e);
    const list = [s.backgroundColor];
    if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) list.push(s.color);
    list.forEach((c) => {
      const v = hue(c);
      if (!v) return;
      colors[v.hex] = (colors[v.hex] || 0) + 1;
      if (v.s > 0.35 && v.h >= 45 && v.h <= 170 && !seenBad.has(v.hex)) {
        seenBad.add(v.hex);
        add('warn', 'зелёный или жёлтый', clip(e.textContent, 30) || e.tagName, v.hex);
      }
    });
  });

  // Повторы одного правила сворачиваем
  const seen = new Set();
  const unique = issues.filter((i) => {
    const k = i.rule + '|' + i.where + '|' + i.detail;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const errors = unique.filter((i) => i.level === 'error').length;
  return JSON.stringify({
    summary: { width: W, root: rootSel, errors, warnings: unique.length - errors },
    issues: unique.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1)).slice(0, 60),
    stats: {
      fonts,
      sizes,
      sectionGaps: gaps,
      headingGaps: headGaps.map((x) => x.g),
      buttonHeights: Object.keys(heights),
      topColors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 12).map((x) => x[0]),
    },
  });
})();
