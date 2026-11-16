"""Сборка сообщений ботов (ТГ/ВК/МАХ) из items.json (gdoc_items.py).

python3 -I items2bots.py <items.json> <spec.json> <out.json>
spec: {"prefix":"[{ch}] [ОВ0-06.11.26] … / ","samples":{"ТГ":23198403,"ВК":23198402,"МАХ":23198405},
       "bots":[{"key","ranges":[[a,b],…],"btns":[n,…],"chans":["ТГ","ВК","МАХ"],"banner":"06"|null,
                "keep_hl":[n…],"btns_by_ch":{"ВК":[n…]}}]}
Правила: <p> на абзац; пустая строка между абзацами — <p>&nbsp;</p> (ВК — <p><br></p>); пункты «— »/«🔹»/«→»
идут подряд; li → «🔹 »; кнопки в конец с пустым href; жёлтые (hl) строки не берутся, кроме keep_hl;
«новые» эмодзи 🤍🧩 кодируются; длина текста считается для предупреждения о 1024 знаках (ТГ с картинкой).
"""
import html, json, re, sys

items = {x['n']: x for x in json.load(open(sys.argv[1])) if 'n' in x}
spec = json.load(open(sys.argv[2]))
NEW = {'\U0001F90D': '&#x1F90D;', '\U0001F9E9': '&#x1F9E9;', '\U0001F929': '&#x1F929;'}


def paras(n):
    x = items[n]
    h = re.sub(r'\s+', ' ', x['html'].replace('​', '').replace('\xa0', ' ')).strip()
    h = re.sub(r'<(b|i)>\s*(<br>)?\s*</\1>', '', h)
    out = []
    for p in re.split(r'<br>', h):
        p = p.strip()
        if not re.sub(r'<[^>]+>', '', p).strip():
            continue
        for tg in ('b', 'i'):
            if p.count('<%s>' % tg) > p.count('</%s>' % tg):
                p += '</%s>' % tg
            if p.count('</%s>' % tg) > p.count('<%s>' % tg):
                p = '<%s>' % tg + p
        out.append(p)
    if x['t'] == 'li':
        out = ['🔹 ' + p for p in out]
    return out


def label(n):
    return re.sub(r'<[^>]+>', '', items[n]['html']).strip().strip('[] ').strip()


isl = lambda p: bool(re.match(r'^(<b>)?(— |🔹 |→ ?|\d\. )', p))
jobs = []
for b in spec['bots']:
    ns = [n for a, z in b['ranges'] for n in range(a, z + 1) if not items[n]['hl'] or n in b.get('keep_hl', [])]
    ps = [p for n in ns for p in paras(n)]
    for ch in b['chans']:
        sep = '<p><br></p>' if ch == 'ВК' else '<p>&nbsp;</p>'
        body = []
        for i, p in enumerate(ps):
            if body and not (isl(p) and isl(ps[i - 1])):
                body.append(sep)
            body.append('<p>' + p + '</p>')
        btns = b.get('btns_by_ch', {}).get(ch, b['btns'])
        body += ['<p><a href="">%s</a></p>' % label(n) for n in btns]
        h = ('' if ch == 'ВК' else '\n').join(body) if ch == 'ВК' else '\n'.join(body)
        for k, v in NEW.items():
            h = h.replace(k, v)
        ln = len(html.unescape(re.sub(r'<[^>]+>', '', '\n'.join(ps))))
        jobs.append({'ch': ch, 'sample': spec['samples'][ch], 'title': spec['prefix'].format(ch=ch) + b['key'],
                     'html': h, 'banner': b.get('banner'), 'len': ln})
json.dump(jobs, open(sys.argv[3], 'w'), ensure_ascii=False)
for j in jobs:
    print(j['title'][-40:], j['ch'], 'знаков', j['len'], '>1024!' if j['len'] > 1024 and j['banner'] else '')
