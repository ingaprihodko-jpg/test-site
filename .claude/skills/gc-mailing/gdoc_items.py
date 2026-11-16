"""Разбор HTML-выгрузки Google Docs (download_file_content, exportMimeType text/html) в список абзацев.

python3 -I gdoc_items.py <tool-result.json> <out_dir>
  -> out_dir/items.json  [{n, t: p|li|h1..h6, html (<b> жирный, <i> курсив, <a href> ссылки — адрес очищен от google.com/url), txt, hl (жёлтая заливка = служебная пометка), href}]
     и TR-маркеры строк таблиц; печатает пронумерованный список.
Комментарии Google Docs ([a], [b]…) из текста отбрасываются; к чему они привязаны — смотреть по cmnt_ref в doc.html.
"""
import base64, html, json, re, sys, urllib.parse
from html.parser import HTMLParser

src, out_dir = sys.argv[1], sys.argv[2]
d = json.load(open(src))
h = d['content']
if not h.lstrip().startswith('<'):
    h = base64.b64decode(h).decode('utf-8', 'replace')
h = re.sub(r'src="data:[^"]*"', 'src="IMG"', h)
open(out_dir + '/doc.html', 'w').write(h)

BL = ('p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6')


class P(HTMLParser):
    def __init__(s):
        super().__init__()
        s.out, s.cur, s.stack, s.skip = [], None, [], 0

    def handle_starttag(s, t, a):
        a = dict(a)
        st = a.get('style') or ''
        if t in BL:
            s.cur = {'t': t, 'html': '', 'txt': '', 'hl': False}
        elif t == 'sup':
            s.skip += 1  # ссылки на комментарии
        elif t == 'span' and s.cur is not None:
            b = 'font-weight:700' in st
            i = 'font-style:italic' in st
            s.stack.append((b, i))
            if 'background-color:#ffff00' in st:
                s.cur['hl'] = True
            s.cur['html'] += ('<b>' if b else '') + ('<i>' if i else '')
        elif t == 'a' and s.cur is not None and a.get('href', '').startswith('http'):
            href = a.get('href')
            m = re.match(r'https://www\.google\.com/url\?q=([^&]+)', href)
            if m:
                href = urllib.parse.unquote(m.group(1))
            s.cur.setdefault('href', href)
            s.cur['html'] += '<a href="%s">' % html.escape(href)
            s.a_open = True
        elif t == 'br' and s.cur is not None:
            s.cur['html'] += '<br>'
            s.cur['txt'] += '\n'
        elif t == 'tr':
            s.out.append({'t': 'TR'})
        elif t == 'img':
            s.out.append({'t': 'IMG'})

    def handle_endtag(s, t):
        if t == 'a' and getattr(s, 'a_open', False) and s.cur is not None:
            s.cur['html'] += '</a>'
            s.a_open = False
        elif t == 'sup':
            s.skip -= 1
        elif t == 'span' and s.cur is not None and s.stack:
            b, i = s.stack.pop()
            s.cur['html'] += ('</i>' if i else '') + ('</b>' if b else '')
        elif t in BL and s.cur is not None:
            if s.cur['txt'].strip():
                s.out.append(s.cur)
            s.cur = None

    def handle_data(s, data):
        if s.cur is not None and not s.skip:
            s.cur['txt'] += data
            s.cur['html'] += html.escape(data, quote=False)


p = P()
p.feed(h)
items, n = [], 0
for x in p.out:
    if 'html' in x:
        x['html'] = re.sub(r'</b>(\s*)<b>', r'\1', x['html']).replace('\xa0', ' ').strip()
        x['html'] = re.sub(r'</i>(\s*)<i>', r'\1', x['html'])
        x['html'] = re.sub(r'<b>\s*</b>|<i>\s*</i>', '', x['html'])
        n += 1
        x['n'] = n
    items.append(x)
json.dump(items, open(out_dir + '/items.json', 'w'), ensure_ascii=False)
for x in items:
    if x['t'] in ('TR', 'IMG'):
        print('   --' + x['t'])
        continue
    href = ' {' + x['href'][:90] + '}' if x.get('href') else ''
    print(x['n'], x['t'], 'HL' if x['hl'] else '  ', x['html'][:400] + href)
