#!/usr/bin/env python3
"""Собирает из макета код для HTML-блока GetCourse.

python3 mk_embed.py <макет.html> <результат.html> [--font "Manrope"]
python3 mk_embed.py --typograph <макет.html>   # только неразрывные пробелы, в самом макете
"""
import argparse
import hashlib
import re
import sys

PAGES_URL = "https://ingaprihodko-jpg.github.io/test-site"

# Короткие слова, которые не остаются в конце строки
GLUE = (
    "в во с со к ко о об от у а и я до за из на не ни но по при для без над под про "
    "через между что чтобы если когда или же ли бы то ты он она оно мы вы они это как так да"
).split()
GLUE_RE = re.compile(
    r"(?<![\w-])(" + "|".join(GLUE) + r")\s+(?=\S)", re.IGNORECASE | re.UNICODE
)
TAG_RE = re.compile(r"(<[^>]+>)")
SKIP_RE = re.compile(r"(<(script|style|svg|textarea)\b.*?</\2>)", re.S | re.I)
LAST_PAIR_RE = re.compile(r"(<(p|li)\b[^>]*>)(.*?)(</\2>)", re.S | re.I)
# Самая длинная неразрывная концовка в символах: длиннее не влезет в 343px при 18px
TAIL_MAX = 24


def rem_to_px(text):
    return re.sub(
        r"(?<![\w.-])(\d*\.?\d+)rem\b",
        lambda m: f"{round(float(m.group(1)) * 16, 2):g}px",
        text,
    )


def glue_words(chunk):
    parts = TAG_RE.split(chunk)
    for i, part in enumerate(parts):
        if part and not part.startswith("<"):
            parts[i] = GLUE_RE.sub(lambda m: m.group(1) + "&nbsp;", part)
    return "".join(parts)


def glue_last_pair(match):
    start, _, body, end = match.groups()
    parts = TAG_RE.split(body)
    # Последний непустой текст: пробел перед последним словом
    for i in range(len(parts) - 1, -1, -1):
        part = parts[i]
        if part and not part.startswith("<") and part.strip():
            trimmed = part.rstrip()
            m = re.search(r"(\S+)\s+(\S+)$", trimmed)
            # Хвост уже склеен (повторный запуск или предлог) — не наращивать цепочку,
            # а слишком длинную пару не склеивать: она шире телефона
            if m and "&nbsp;" not in m.group(2):
                tail = (m.group(1) + " " + m.group(2)).replace("&nbsp;", " ")
                if len(tail) <= TAIL_MAX:
                    parts[i] = trimmed[: m.end(1)] + "&nbsp;" + m.group(2) + part[len(trimmed):]
            break
    return start + "".join(parts) + end


def typograph(body):
    pieces = SKIP_RE.split(body)
    out = []
    i = 0
    while i < len(pieces):
        # re.split с двумя группами: текст, блок, имя тега
        out.append(LAST_PAIR_RE.sub(glue_last_pair, glue_words(pieces[i])))
        if i + 1 < len(pieces):
            out.append(pieces[i + 1])
        i += 3
    return "".join(out)


def absolute_assets(text):
    return re.sub(
        r"""(?P<q>["'(])(?:\./)?assets/""", lambda m: f"{m.group('q')}{PAGES_URL}/assets/", text
    )


def guard_css(font):
    stack = f"'{font}',sans-serif"
    return (
        "<style>"
        f"body,.lite-page.block-set,.lt-raw-html,.lt-block-wrapper,.f5-root{{font-family:{stack}!important}}"
        "[data-reveal]{opacity:1!important}"
        ".f5-root :where(p,li){text-wrap:pretty}"
        ".f5-root :where(h1,h2,h3){text-wrap:balance}"
        "</style>"
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst", nargs="?")
    ap.add_argument("--typograph", action="store_true")
    ap.add_argument("--font", default="Manrope")
    args = ap.parse_args()

    html = open(args.src, encoding="utf-8").read()

    if args.typograph:
        fixed = re.sub(
            r"(<body\b[^>]*>)(.*)(</body>)",
            lambda m: m.group(1) + typograph(m.group(2)) + m.group(3),
            html,
            flags=re.S | re.I,
        )
        with open(args.src, "w", encoding="utf-8") as f:
            f.write(fixed)
        print(f"Типографика обновлена: {args.src}")
        return
    if not args.dst:
        sys.exit("Укажите файл результата")

    head_links = re.findall(
        r"<link\b[^>]*fonts\.(?:googleapis|gstatic)[^>]*>", html, re.I
    )
    styles = re.findall(r"<style\b[^>]*>.*?</style>", html, re.S | re.I)
    m = re.search(r"<body\b[^>]*>(.*)</body>", html, re.S | re.I)
    if not m:
        sys.exit("В макете нет <body>")
    body = typograph(m.group(1).strip())

    out = "\n".join(head_links + styles + [guard_css(args.font), body])
    out = absolute_assets(rem_to_px(out))

    problems = []
    if 'class="f5-root' not in body:
        problems.append("нет контейнера .f5-root: стили GC могут перебить страницу")
    if re.search(r"\d\s*rem\b", out):
        problems.append("остались значения в rem")
    bad = sorted(set(re.findall(r"""(?:src|href)=["'](?!https?:|data:|#|mailto:|tel:|javascript:)([^"']+)""", out)))
    if bad:
        problems.append("относительные ссылки: " + ", ".join(bad[:10]))
    generic = sorted(
        set(re.findall(r"""class=["'](?:[^"']*\s)?(h1|h2|btn|btn-primary|nav|logo|badge|price|prose|divider|open)(?:\s[^"']*)?["']""", body))
    )
    if generic:
        problems.append("классы, занятые платформой: " + ", ".join(generic))

    with open(args.dst, "w", encoding="utf-8") as f:
        f.write(out)

    print(f"Готово: {args.dst}, {len(out.encode('utf-8')) // 1024} КБ")
    print("SHA-256:", hashlib.sha256(out.encode("utf-8")).hexdigest())
    for p in problems:
        print("ВНИМАНИЕ:", p)


if __name__ == "__main__":
    main()
