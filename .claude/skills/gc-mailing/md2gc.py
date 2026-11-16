import re, sys, json
lines = open(sys.argv[1], encoding='utf-8').read().split('\n')
def clean(s):
    s = re.sub(r'<comment_(start|end) id=\w+>', '', s)
    s = s.replace('\\_', '_').replace('\\!', '!').replace('\\[', '[').replace('\\]', ']')
    return s.strip()
def typo(s):
    s = re.sub(r'(?<![\w-])([А-Яа-яЁёA-Za-z]{1,2}) (?=\S)', r'\1&nbsp;', s)
    s = re.sub(r'(?<![\w-])([А-Яа-яЁёA-Za-z]{1,2}) (?=\S)', r'\1&nbsp;', s)  # подряд идущие короткие
    s = re.sub(r' (бы|ли|же)\b', r'&nbsp;\1', s)
    s = s.replace(' — ', '&nbsp;— ')
    s = re.sub(r'(\d) (\d{3})', r'\1&nbsp;\2', s)
    s = re.sub(r'(\d) (?=[А-Яа-яЁё])', r'\1&nbsp;', s)  # «15 лет», «3 лекции», «5 000 руб.»
    return s
def inline(s):
    s = re.sub(r'\*\*(.+?)\*\*', lambda m: '<strong>'+m.group(1).strip()+'</strong>', s)
    s = re.sub(r'\*(.+?)\*', r'<em>\1</em>', s)
    return typo(s)
def block(a, b, greet=False):
    out, inlist = [], False
    for i, raw in enumerate(lines[a-1:b]):
        l = clean(raw)
        if not l: continue
        if l.startswith('|'):
            cells = [c.strip() for c in l.strip().strip('|').split('|')]
            if len(cells) < 2 or all(re.match(r'^:?-+:?$', c) for c in cells if c): continue  # кнопка или разделитель
            if inlist: out.append('</ul>'); inlist = False
            row = ''.join('<td style="border:1px solid #ccc;padding:6px 8px;">%s</td>' % inline(c) for c in cells)
            if out and out[-1].startswith('<table'):
                out[-1] = out[-1].replace('</table>', '<tr>%s</tr></table>' % row)
            else:
                out.append('<table style="border-collapse:collapse;width:100%%;"><tr>%s</tr></table>' % row)
            continue
        if l.startswith('- '):
            if not inlist: out.append('<ul>'); inlist = True
            out.append('<li><p>'+inline(l[2:])+'</p></li>')
        else:
            if inlist: out.append('</ul>'); inlist = False
            out.append('<p>'+inline(l)+'</p>')
    if inlist: out.append('</ul>')
    # пустая строка между абзацами и списками (иначе в письме всё слитно)
    res, depth = [], 0
    for el in out:
        if depth == 0 and res and el in ('<ul>',) or (depth == 0 and res and (el.startswith('<p>') or el.startswith('<table'))):
            res.append('<p><br></p>')
        res.append(el)
        if el == '<ul>': depth += 1
        elif el == '</ul>': depth -= 1
    return ''.join(res)
res = {k: block(*v) for k, v in json.loads(sys.argv[2]).items()}
json.dump(res, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
for k, v in res.items(): print(k, len(v)); print(v[:600].replace('&nbsp;','~')); print()
