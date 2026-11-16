#!/usr/bin/env python3
"""
tsss.site — списание бонусов ЧЧ26 (1 марта).

Правило: первыми тратятся бонусы ЧЧ26.
  к списанию = max(0, начислено_ЧЧ26 − потрачено бонусами с даты начисления)

Вход (выгрузки GetCourse в CSV или XLSX):
  1) users    — пользователи с тегом «ЧЧ26 бонусы»: колонка Email
                и доп. поле «ЧЧ26 начислено» (сумма). Если поля нет,
                берётся --amount.
  2) payments — Продажи → Платежи, фильтр: тип «Бонусный счет»,
                статус «Получен», создан с даты начисления ЧЧ26 по 28.02.
                Нужны колонки с email клиента и «Сумма».

Выход (в папку --out):
  ch26-writeoff.csv      — email, начислено, потрачено, к списанию
  ch26-import.csv        — email + «ЧЧ26 к списанию» для импорта в GC
  ch26-groups.txt        — сколько людей на каждую сумму (для массового списания)

Запуск:
  python3 tsss-ch26-bonus-writeoff.py --users users.csv --payments pay.csv \
      --out result/ [--amount 1000] [--round 10]
"""
import argparse, csv, os, re, sys
from collections import Counter, defaultdict


def read_table(path):
    if path.lower().endswith((".xlsx", ".xls")):
        from openpyxl import load_workbook
        ws = load_workbook(path, read_only=True, data_only=True).active
        rows = [[("" if c is None else str(c)) for c in r] for r in ws.iter_rows(values_only=True)]
    else:
        raw = open(path, "rb").read()
        for enc in ("utf-8-sig", "cp1251"):
            try:
                text = raw.decode(enc); break
            except UnicodeDecodeError:
                continue
        delim = ";" if text.split("\n", 1)[0].count(";") > text.split("\n", 1)[0].count(",") else ","
        rows = list(csv.reader(text.splitlines(), delimiter=delim))
    head = [h.strip() for h in rows[0]]
    return head, rows[1:]


def find_col(head, *patterns, required=True, label=""):
    for p in patterns:
        for i, h in enumerate(head):
            if re.search(p, h, re.I):
                return i
    if required:
        sys.exit(f"Не нашла колонку «{label}». Колонки в файле: {head}")
    return None


def money(s):
    s = re.sub(r"[^\d,.\-]", "", str(s)).replace(",", ".")
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def email_in(s):
    m = re.search(r"[\w.+\-]+@[\w\-]+\.[\w.\-]+", str(s))
    return m.group(0).lower() if m else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--users", required=True)
    ap.add_argument("--payments", required=True)
    ap.add_argument("--out", default="ch26-result")
    ap.add_argument("--amount", type=float, default=None, help="сумма ЧЧ26, если нет доп. поля")
    ap.add_argument("--round", type=int, default=1, help="округлять сумму списания вниз до N ₽")
    a = ap.parse_args()

    # --- кому и сколько начислили
    head, rows = read_table(a.users)
    ci_mail = find_col(head, r"^e-?mail$", r"mail", label="Email")
    ci_amt = find_col(head, r"ЧЧ26.*начисл", required=False)
    if ci_amt is None and a.amount is None:
        sys.exit("Нет колонки «ЧЧ26 начислено» — укажите --amount")
    credited = {}
    for r in rows:
        e = email_in(r[ci_mail]) if ci_mail < len(r) else None
        if not e:
            continue
        amt = money(r[ci_amt]) if ci_amt is not None and ci_amt < len(r) else 0
        credited[e] = credited.get(e, 0) + (amt or a.amount or 0)

    # --- сколько потратили бонусами
    head, rows = read_table(a.payments)
    ci_pmail = find_col(head, r"mail", r"Клиент", r"Пользоват", label="email клиента")
    ci_sum = find_col(head, r"^Сумма$", r"Сумма", label="Сумма")
    ci_type = find_col(head, r"Тип платежа", required=False)
    ci_status = find_col(head, r"Статус", required=False)
    spent = defaultdict(float)
    skipped = 0
    for r in rows:
        if ci_type is not None and ci_type < len(r) and r[ci_type] and "бонус" not in r[ci_type].lower():
            skipped += 1; continue
        if ci_status is not None and ci_status < len(r) and r[ci_status] and "получ" not in r[ci_status].lower():
            skipped += 1; continue
        e = email_in(r[ci_pmail]) if ci_pmail < len(r) else None
        if e:
            spent[e] += money(r[ci_sum])

    # --- расчёт
    os.makedirs(a.out, exist_ok=True)
    groups = Counter()
    total = 0
    with open(os.path.join(a.out, "ch26-writeoff.csv"), "w", newline="", encoding="utf-8-sig") as f1, \
         open(os.path.join(a.out, "ch26-import.csv"), "w", newline="", encoding="utf-8-sig") as f2:
        w1 = csv.writer(f1, delimiter=";"); w2 = csv.writer(f2, delimiter=";")
        w1.writerow(["email", "начислено ЧЧ26", "потрачено бонусами", "к списанию"])
        w2.writerow(["email", "ЧЧ26 к списанию"])
        for e, c in sorted(credited.items()):
            left = max(0.0, c - spent.get(e, 0.0))
            left = int(left // a.round * a.round)
            w1.writerow([e, int(c), int(spent.get(e, 0)), left])
            w2.writerow([e, left])
            if left > 0:
                groups[left] += 1
                total += left

    with open(os.path.join(a.out, "ch26-groups.txt"), "w", encoding="utf-8") as f:
        f.write(f"Начислено ЧЧ26: {len(credited)} чел.\n")
        f.write(f"К списанию: {sum(groups.values())} чел., всего {total} ₽\n")
        f.write(f"Разных сумм (= массовых списаний): {len(groups)}\n\n")
        for amt, n in sorted(groups.items(), reverse=True):
            f.write(f"{amt} ₽ — {n} чел.\n")

    print(open(os.path.join(a.out, "ch26-groups.txt"), encoding="utf-8").read())
    if skipped:
        print(f"(пропущено строк платежей не того типа/статуса: {skipped})")


if __name__ == "__main__":
    main()
