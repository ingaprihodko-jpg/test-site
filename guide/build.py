"""Собирает genius-guide.html: исходник + уроки из lessons.txt, затем типографика и PDF.

Запуск: python3 guide/build.py            — «Гений общения»
        python3 guide/build.py questions  — «Гений вопросов»
        python3 guide/build.py manipulators  — «Страшные манипуляторы»
"""
import html as H
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent
IMG = 'img/'
TOTAL = 0
# картинки с обрезанным низом: ставим вплотную к краю страницы, чтобы не висели
EDGE = {'gift-friends.png', 'hero-characters.png', 'intro-friends.png', 'glove.png', 'q-roses.png', 'q-whatif.png',
        'm-detective.png', 'm-pointing.png', 'm-giftbox.png', 'm-n3.png', 'm-n12.png', 'm-n13.png', 'm-n14.png', 'q-n4.png', 'q-n7.png', 'q-n11.png', 'q-n13.png'}
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'


def inline(t):
    t = H.escape(t, quote=False)
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)


def para(line):
    if line.startswith('> '):
        return f'<p class="dl">{inline(line[2:])}</p>'
    if line.startswith('~ '):
        return f'<p class="stage">{inline(line[2:])}</p>'
    if line.startswith('src '):
        return f'<p class="src">{inline(line[4:])}</p>'
    return f'<p>{inline(line)}</p>'


def cycle():
    items = [('prd-dragon.png', 'Дракон съедает принцессу'),
             ('prd-princess.png', 'Принцесса очаровывает рыцаря'),
             ('prd-knight.png', 'Рыцарь убивает дракона')]
    cells = ''.join(f'<div><img src="{IMG}{i}" alt="">{inline(t)}</div>' for i, t in items)
    return f'<div class="cycle">{cells}</div>'


def parse(lines, i, stop=None):
    """Разбирает строки до закрывающего тега, возвращает (html, индекс)."""
    out = []
    while i < len(lines):
        ln = lines[i].rstrip()
        i += 1
        if not ln:
            continue
        if stop and ln == stop:
            return ''.join(out), i
        if ln.startswith('# '):
            num, title, color, img, sub = [x.strip() for x in (ln[2:].split('|') + ['', '', ''])[:5]]
            if out and stop is None:
                out.append('</section>')
            edge = ' edge' if img in EDGE else ''
            art = f'<img class="art{edge}" src="{IMG}{img}" alt="">' if img else ''
            # короткие слова склеиваются со следующим, самая длинная связка должна влезть в строку
            glued = re.sub(r'(?i)(?<![\wА-Яа-яЁё])(' + SHORT + r') ', lambda g: g.group(1) + '~', title)
            longest = max(len(w) for w in re.split(r'[\s=-]+', glued))
            size = min(50, round(482 / (longest * .98), 1))
            shown = inline(title).replace('=', '=<wbr>')
            out.append(f'<section class="opener {color}"><div class="halo"></div>'
                       f'<div class="num">Урок {num}/{TOTAL}</div>'
                       + (f'<div class="sub">{inline(sub)}</div>' if sub else '')
                       + f'<h2 style="font-size:{size}pt">{shown}</h2>{art}</section>'
                       f'<section class="lesson">')
            continue
        m = re.match(r'^\[(\w+)\s*(.*)\]$', ln)
        if m and m.group(1) in ('two', 'three'):
            inner, i = parse(lines, i, f'[/{m.group(1)}]')
            out.append(f'<div class="{m.group(1)} block">{inner}</div>')
            continue
        if ln == '---':  # разрыв страницы, как в документе
            out.append('<div class="pb"></div>')
            continue
        if ln == '[cycle]':
            out.append(cycle())
            continue
        if m and ln.startswith('[pic'):
            out.append(f'<div class="block pic"><img src="{IMG}{m.group(2)}" alt=""></div>')
            continue
        if m and ln.startswith('[ph'):
            out.append(f'<div class="block ph-img">{inline(m.group(2))}</div>')
            continue
        if m:
            kind, arg = m.group(1), m.group(2)
            body, i = collect(lines, i)
            if kind == 'finale':
                out.append('</section>' + block(kind, arg, body) + '<section>')
            else:
                out.append(block(kind, arg, body))
            continue
        tag, _, text = ln.partition(' ')
        if tag == 'p':
            out.append(f'<p>{inline(text)}</p>')
        elif tag == 'lead':
            out.append(f'<p class="lead">{inline(text)}</p>')
        elif tag == 'h':
            out.append(f'<h3>{inline(text)}</h3>')
        elif tag == 'src':
            out.append(f'<p class="src">{inline(text)}</p>')
        elif tag == 'quote':
            out.append(f'<div class="block quote">{inline(text)}</div>')
        else:
            raise ValueError(f'Не понял строку {i}: {ln}')
    if stop is None:
        out.append('</section>')
    return ''.join(out), i


def collect(lines, i):
    """Строки до [/] с учётом вложенного [list]."""
    body, depth = [], 0
    while True:
        ln = lines[i].rstrip()
        i += 1
        if ln == '[list]':
            depth += 1
        if ln == '[/]':
            if depth == 0:
                return body, i
            depth -= 1
        body.append(ln)


def render_body(body):
    out, items, in_list = [], [], False
    for ln in body:
        if not ln:
            continue
        if ln == '---':  # разрыв страницы внутри блока
            out.append('<div class="pb"></div>')
        elif ln == '[list]':
            in_list, items = True, []
        elif ln == '[/]' and in_list:
            out.append('<ul class="bul">' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ul>')
            in_list = False
        elif in_list:
            items.append(ln[2:])
        elif ln.startswith('[list]'):
            pass
        else:
            out.append(para(ln))
    return ''.join(out)


def block(kind, arg, body):
    b = render_body(body)
    if kind == 'case' and '---' in body:  # разрыв страницы: история продолжается отдельным блоком
        parts, cur = [], []
        for x in body:
            if x == '---':
                parts.append(cur)
                cur = []
            else:
                cur.append(x)
        return '<div class="pb"></div>'.join(block('case', arg if k == 0 else '', x) for k, x in enumerate(parts + [cur]))
    if kind == 'case':
        kick = f'<div class="kicker">{inline(arg)}</div>' if arg else ''
        cls = ' long' if sum(len(x) for x in body) > 900 or len(body) > 14 else ''  # короткую историю не рвём
        return f'<div class="block case{cls}">{kick}{b}</div>'
    if kind == 'rule':
        kick = f'<div class="kicker">{inline(arg)}</div>' if arg else ''
        text = ' '.join(x for x in body if x)
        cls = ' long' if len(text) > 90 else ''
        return f'<div class="block rule{cls}">{kick}<div class="disp">{inline(text)}</div></div>'
    if kind == 'task':
        k, _, t = arg.partition('|')
        title = f'<h3>{inline(t.strip())}</h3>' if t.strip() else ''
        if not title:
            title, k = f'<h3>{inline(k.strip())}</h3>', ''
        kick = f'<div class="kicker">{inline(k.strip())}</div>' if k.strip() else ''
        return f'<div class="task-head">{kick}{title}{b}</div>'
    if kind == 'card':
        return f'<div class="card block"><h4>{inline(arg)}</h4>{b}</div>'
    if kind == 'poll':
        opts = ''.join(f'<li>{inline(x[2:])}</li>' for x in body if x.startswith('- '))
        cls = ' single' if any(len(x) > 45 for x in body) else ''
        return f'<div class="block poll{cls}"><div class="q">{inline(arg)}</div><ul>{opts}</ul></div>'
    if kind == 'poll1':
        return f'<div class="block poll1"><div class="q">{inline(arg)}</div></div>'
    if kind == 'write':
        return f'<div class="block write"><div class="q">{inline(arg)}</div>' + '<div class="ln"></div>' * 3 + '</div>'
    if kind == 'qa':
        n, _, q = arg.partition('|')
        n = n.strip()
        num = f'<div class="n">{n}</div>' if n else ''
        cls = '' if n else ' nonum'
        return f'<div class="block qa{cls}">{num}<div><div class="qq">{inline(q.strip())}</div><div class="ans">{b}</div></div></div>'
    if kind == 'var':
        tone, _, phrase = arg.partition('|')
        tone = tone.strip()
        sign = {'plus': '+', 'minus': '−', 'neutral': '?'}[tone]
        return f'<div class="var {tone}"><b class="sg">{sign}</b><div><div class="ph">{inline(phrase.strip())}</div>{b}</div></div>'
    if kind == 'hero':
        img, _, name = arg.partition('|')
        return f'<div class="herocard"><img src="{IMG}{img.strip()}" alt=""><div><h4>{inline(name.strip())}</h4>{b}</div></div>'
    if kind == 'step':
        return f'<div class="step"><div class="tag">{inline(arg)}</div><div>{b}</div></div>'
    if kind == 'author':
        paras = [x for x in body if x]
        text = f'<p class="lead">{inline(paras[0])}</p>' + ''.join(para(x) for x in paras[1:])
        return f'<div class="block author-note"><div class="ph"><img src="{IMG}{arg}" alt="Ольга Грищенко"></div><div>{text}</div></div>'
    if kind == 'tech':
        n, title, tone = [x.strip() for x in arg.split('|')]
        desc = ''.join(f'<p class="desc">{inline(x[2:])}</p>' for x in body if x.startswith('d '))
        main = ''.join(f'<p class="ex">{inline(x[3:])}</p>' if x.startswith('ex ') else f'<p>{inline(x)}</p>'
                       for x in body if x and not x.startswith('d '))
        sign = '+' if tone == 'plus' else '−'
        return (f'<div class="tech"><div class="n">{n}</div><div><h4>{inline(title)}</h4>{desc}'
                f'<div class="verdict {tone}"><b>{sign}</b><div>{main}</div></div></div></div>')
    if kind == 'finale':
        paras = [x for x in body if x]
        sign = ''.join(f'<div class="sign">{inline(x[5:])}</div>' for x in paras if x.startswith('sign '))
        text = ''.join(f'<p>{inline(x)}</p>' for x in paras if not x.startswith('sign '))
        return (f'<section class="finale"><div class="halo"></div><h2>{inline(arg)}</h2>{text}{sign}'
                f'<img class="art" src="{IMG}olga-photo.png" alt=""></section>')
    if kind == 'list':
        return '<ul class="bul">' + ''.join(f'<li>{inline(x[2:])}</li>' for x in body if x) + '</ul>'
    if kind == 'answer':
        return f'<div class="block answer"><div class="kicker">{inline(arg)}</div>{b}</div>'
    raise ValueError(kind)


SHORT = (r'в|с|к|о|у|а|и|я|до|за|из|от|по|при|для|без|над|под|про|через|между|но|что|чтобы|если|когда|или|'
         r'не|ни|мы|вы|он|она|они|ты|это|на|об|же|—|–|-')


def glue(doc):
    head, body = doc.split('<body>', 1)

    def fix(t):
        t = re.sub(r'(?i)(?<![\wА-Яа-яЁё])(' + SHORT + r') (?=\S)', lambda m: m.group(1) + '\u00a0', t)
        t = re.sub(r' (—|–)', lambda m: '\u00a0' + m.group(1), t)
        t = re.sub(r'(№|(?<![А-Яа-яЁё])т\.) ', '\\1\u00a0', t)
        t = re.sub(r'(?<![\wА-Яа-яЁё])([А-ЯЁ]\.) (?=[А-ЯЁ])', '\\1\u00a0', t)
        return re.sub(r'(\d) (?=\S)', '\\1\u00a0', t)

    body = re.sub(r'>([^<]+)<', lambda m: '>' + fix(m.group(1)) + '<', body)

    def last(m):
        inner = re.sub(r' ([^ <>]+)\s*$', '\u00a0\\1', m.group(2), count=1)
        return m.group(1) + inner + m.group(3)

    body = re.sub(r'(<(?:p|li|div class="(?:q|qq|ph|quote|next)")[^>]*>)((?:(?!</?(?:p|li|div)\b)[\s\S])*?)(</(?:p|li|div)>)',
                  last, body)
    return head + '<body>' + body


GUIDES = {
    'genius': ('lessons.txt', 'genius-guide.src.html', 'genius-guide'),
    'questions': ('questions.txt', 'questions-guide.src.html', 'questions-guide'),
    'manipulators': ('manipulators.txt', 'manipulators-guide.src.html', 'manipulators-guide'),
}


def main():
    global TOTAL
    name = sys.argv[1] if len(sys.argv) > 1 else 'genius'
    txt, srcname, outname = GUIDES[name]
    # «---» — страницы документа; текст теперь течёт свободно, разрывы не ставим
    lines = [x for x in (ROOT / txt).read_text(encoding='utf-8').splitlines() if x != '---']
    TOTAL = sum(1 for x in lines if x.startswith('# '))
    lessons, _ = parse(lines, 0)
    lessons = lessons.replace('<section></section>', '')
    src = (ROOT / srcname).read_text(encoding='utf-8')
    out = ROOT / f'{outname}.html'
    out.write_text(glue(src.replace('<!--LESSONS-->', lessons)), encoding='utf-8')
    # Chrome не всегда может писать в папку проекта — печатаем во временную и копируем
    tmp = Path(tempfile.gettempdir()) / f'{outname}.pdf'
    tmp.unlink(missing_ok=True)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=10000',
                    f'--print-to-pdf={tmp}', out.resolve().as_uri()],
                   stderr=subprocess.DEVNULL)  # Chrome иногда падает при закрытии, уже записав PDF
    shutil.move(tmp, ROOT / f'{outname}.pdf')


if __name__ == '__main__':
    main()
