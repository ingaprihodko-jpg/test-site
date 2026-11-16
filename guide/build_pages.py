"""«Страшные манипуляторы»: вёрстка строго по тексту и страницам документа.

Исходник manipulators-doc.txt — текст Google Doc как есть, «———» = разрыв страницы в документе.
Каждая страница документа = одна страница PDF. Ничего от себя не дописываем.

Запуск: python3 guide/build_pages.py
"""
import html as H
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from build import CHROME, ROOT, glue

# иллюстрации к первым страницам уроков (только картинки, без текста)
ART = {1: 'm-magician.png', 2: 'm-two-men.png', 3: 'm-detective.png', 4: 'm-giftbox.png', 5: 'mirror.png',
       6: 'm-pointing.png', 8: 'chess-player.png', 10: 'door-peek.png', 11: 'm-heart.png', 12: 'm-reality.png',
       13: 'm-megaphone.png', 14: 'm-rush.png', 15: 'm-strong-q.png'}
TONE = ['', 'pink', 'deep']
LESSON = re.compile(r'^\*\*(Урок №\s*(\d+))\*\*$')


def inline(t):
    t = H.escape(t.strip(), quote=False).replace('\\*', '\x00')
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'\*(.+?)\*', r'<i>\1</i>', t)
    return t.replace('\x00', '*')


def page(chunk, n):
    lines = [x.strip() for x in chunk.splitlines() if x.strip()]
    out, items, head = [], [], ''
    if lines and (m := LESSON.match(lines[0])):
        num = int(m.group(2))
        title = lines[1].strip('*')
        art = f'<img src="img/{ART[num]}" alt="">' if num in ART else ''
        small = ' small' if len(lines) > 14 else ''  # длинная страница — шапка урока ниже
        head = (f'<div class="head {TONE[n % 3]}{small}"><div class="lvl">{inline(m.group(1))}</div>'
                f'<h2>{inline(title)}</h2>{art}</div>')
        lines = lines[2:]
        n += 1
    for ln in lines + ['']:
        if ln.startswith('- '):
            items.append(f'<li>{inline(ln[2:])}</li>')
            continue
        if items:
            out.append('<ul>' + ''.join(items) + '</ul>')
            items = []
        if ln:
            out.append(f'<p>{inline(ln.lstrip("# "))}</p>')
    return f'<section class="page">{head}{"".join(out)}</section>', n


def main():
    text = (ROOT / 'manipulators-doc.txt').read_text(encoding='utf-8')
    chunks = re.split(r'\n\s*———\s*\n', text)[1:]  # первая страница документа — название, её заменяет обложка
    pages, n = [], 0
    for c in chunks:
        p, n = page(c, n)
        pages.append(p)
    pages[-1] = pages[-1].replace('</section>', '<img class="fin" src="img/olga-photo.png" alt=""></section>')
    src = (ROOT / 'manipulators-pages.src.html').read_text(encoding='utf-8')
    out = ROOT / 'manipulators-guide.html'
    out.write_text(glue(src.replace('<!--PAGES-->', ''.join(pages))), encoding='utf-8')
    tmp = Path(tempfile.gettempdir()) / 'manipulators-guide.pdf'
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=10000',
                    f'--print-to-pdf={tmp}', out.resolve().as_uri()],
                   check=True, stderr=subprocess.DEVNULL)
    shutil.move(tmp, ROOT / 'manipulators-guide.pdf')
    print(len(chunks) + 1, 'страниц должно быть')


if __name__ == '__main__':
    main()
