import re, sys, json
L = open(sys.argv[1], encoding='utf-8').read().split('\n')
def inl(s):
    s = s.replace('\\_', '_').replace('\\!', '!')
    return re.sub(r'\*\*(.+?)\*\*', lambda m: '<b>'+m.group(1).strip()+'</b>', s).strip()
def part(a, b, buttons=()):
    out, prev_li = [], False
    for raw in L[a-1:b]:
        l = raw.strip()
        if not l: continue
        li = l.startswith('- ')
        if out and not (li and prev_li): out.append('<p>&nbsp;</p>')
        out.append('<p>' + ('🔹' + inl(l[2:]) if li else inl(l)) + '</p>')
        prev_li = li
    if buttons:
        out.append('<p>&nbsp;</p>')
        out += ['<p><a href="">%s</a></p>' % t for t in buttons]
    return '\n'.join(out)
spec = json.loads(sys.argv[2])
res = {k: part(v[0], v[1], v[2] if len(v) > 2 else ()) for k, v in spec.items()}
json.dump(res, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
for k, v in res.items():
    plain = re.sub(r'<[^>]+>', '', v).replace('&nbsp;', ' ')
    print(k, 'символов:', len(re.sub(r'\n', '', plain))); print(v[:300]); print('...'); print(v[-200:]); print()
