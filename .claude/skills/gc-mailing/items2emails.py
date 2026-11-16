"""Сборка писем для конструктора GC из items.json (результат gdoc_items.py).

python3 -I items2emails.py <items.json> <spec.json> <out.json>
spec: [{"key","title","subj":n | "subj_text":"…","pre":n,"img":true|false,"banner":"имя",
        "keep_hl":[n…] (жёлтые строки, которые всё же текст), "as_p":[n…] (заголовок h3 → обычный абзац),
        "skip":[n…] (не брать),
        "layout":[["T",[n1,n2],[n3,n4],...], ["B",n], ["TBL",[a,b],cols], ...]}]
  "TBL" — таблица из абзацев a..b по cols в строке (первая строка — шапка, жирная).
  "T" — текстовый блок из диапазонов номеров абзацев (включительно), "B" — кнопка (подпись = текст абзаца n).
  subj/pre — номер абзаца «Тема: …» / «Прехедер: …» (префикс отрезается).
Выход — формат ov3_emails для editor-setup.js. Абзацы с жёлтой заливкой (hl) в текст не попадают.
"""
import json, re, sys

items = [x for x in json.load(open(sys.argv[1])) if 'n' in x]
byn = {x['n']: x for x in items}
spec = json.load(open(sys.argv[2]))


def typo(s):
    s = re.sub(r'(?<![\w-])([А-Яа-яЁёA-Za-z]{1,2}) (?=\S)', r'\1&nbsp;', s)
    s = re.sub(r'(?<![\w-])([А-Яа-яЁёA-Za-z]{1,2}) (?=\S)', r'\1&nbsp;', s)
    s = re.sub(r' (бы|ли|же)\b', r'&nbsp;\1', s)
    s = s.replace(' — ', '&nbsp;— ')
    s = re.sub(r'(\d) (\d{3})', r'\1&nbsp;\2', s)
    s = re.sub(r'(\d) (?=[А-Яа-яЁё])', r'\1&nbsp;', s)
    return s


def inl(n):
    h = byn[n]['html'].replace('​', '')
    h = re.sub(r'\s+', ' ', h).strip()
    h = h.replace('<b>', '<strong>').replace('</b>', '</strong>').replace('<i>', '<em>').replace('</i>', '</em>')
    h = re.sub(r'\s+(</strong>|</em>)', r'\1 ', h)
    h = re.sub(r'<(strong|em)>\s*(<br>)?\s*</\1>', '', h)
    return re.sub(r'<(strong|em)>\s*</\1>', '', h).strip()


def plain(n):
    return re.sub(r'<[^>]+>', '', byn[n]['html']).replace('\u200b', '').strip()


def label(n):
    return plain(n).strip('[] ').strip()


def table(a, b, cols):
    cells = [inl(n) for n in range(a, b + 1)]
    rows = [cells[i:i + cols] for i in range(0, len(cells), cols)]
    td = 'border:1px solid #ccc;padding:6px 8px;'
    out = ''
    for k, r in enumerate(rows):
        out += '<tr>' + ''.join('<td style="%s">%s</td>' % (td, ('<strong>%s</strong>' % typo(c)) if k == 0 else typo(c)) for c in r) + '</tr>'
    return '<table style="border-collapse:collapse;width:100%%;">%s</table>' % out


AS_P = set()


def block(ns):
    out, inlist = [], False
    for n in ns:
        x = byn[n]
        h = inl(n)
        m = re.match(r'^(<strong>)?●\s*(.*)$', h)
        if x['t'] == 'li' or m:
            if m:
                h = ((m.group(1) or '') + m.group(2)).strip()
            if not inlist:
                out.append('<ul>')
                inlist = True
            out.append('<li><p>' + typo(h) + '</p></li>')
        else:
            if inlist:
                out.append('</ul>')
                inlist = False
            if x['t'] in ('h2', 'h3', 'h4', 'h5', 'h6') and n not in AS_P:
                h = '<strong>' + re.sub(r'</?strong>', '', h) + '</strong>'
            out.append('<p>' + typo(h) + '</p>')
    if inlist:
        out.append('</ul>')
    res, depth = [], 0
    for el in out:
        if depth == 0 and res and (el == '<ul>' or el.startswith('<p>')):
            res.append('<p><br></p>')
        res.append(el)
        depth += el == '<ul>'
        depth -= el == '</ul>'
    return ''.join(res)


E = []
for s in spec:
    AS_P.clear()
    AS_P.update(s.get('as_p', []))
    keep, skip = set(s.get('keep_hl', [])), set(s.get('skip', []))
    lay = []
    for b in s['layout']:
        if b[0] == 'B':
            lay.append(['B', label(b[1])])
        elif b[0] == 'TBL':
            h = table(b[1][0], b[1][1], b[2])
            if lay and lay[-1][0] == 'T':
                lay[-1][4] += '<p><br></p>' + h
            else:
                lay.append(['T', 0, 0, False, h])
        else:
            ns = [n for r in b[1:] for n in range(r[0], r[1] + 1) if (not byn[n]['hl'] or n in keep) and n not in skip]
            h = block(ns)
            if lay and lay[-1][0] == 'T' and lay[-1][4].endswith('</table>'):
                lay[-1][4] += '<p><br></p>' + h
            else:
                lay.append(['T', 0, 0, False, h])
    E.append({'key': s['key'], 'title': s['title'], 'img': s['img'], 'banner': s.get('banner'),
              'subj': s['subj_text'] if 'subj_text' in s else plain(s['subj']).split(':', 1)[1].strip(), 'pre': s['pre_text'] if 'pre_text' in s else plain(s['pre']).split(':', 1)[1].strip(),
              'layout': lay})
json.dump(E, open(sys.argv[3], 'w'), ensure_ascii=False)
for e in E:
    print('==', e['title'], '|', e['subj'], '|', e['pre'], '| img', e['img'], e.get('banner'))
    for b in e['layout']:
        print('   ', b[0], b[1] if b[0] == 'B' else b[4].replace('&nbsp;', '~'))
