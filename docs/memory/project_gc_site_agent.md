---
name: project-gc-site-agent
description: "Агент по сайтам — скилл .claude/skills/gc-site: ТЗ → макет → проверка qa.js → вставка в GC; цвета по умолчанию сняты с pariscreatorweek.com"
metadata:
  type: project
---

Скилл `.claude/skills/gc-site` собирает страницы на GetCourse (создан 2026-11-02): `SKILL.md` — шаги, `palette.md` — цвета, `rules.md` — правила из правок клиентов, `qa.js` — проверка в браузере, `mk_embed.py` — код для блока GC.

Цвета новых страниц по умолчанию — с https://pariscreatorweek.com (тёмный #0E0818, акценты #F0187A → #6B4DFF). Пользователь попросила сохранить их в инструкции; берём только цвета, не шрифты. Свои цвета в ТЗ или проекте важнее.

**Why:** клиенты постоянно возвращают одни и те же правки по шрифтам, типографике и отступам.
**How to apply:** новую повторяющуюся правку клиента сразу записывать в `rules.md`, а измеримую — ещё и в `qa.js`. Общие правила: [[feedback-typography-rules]], особенности GC: [[feedback-getcourse-reveal-and-editor]].
