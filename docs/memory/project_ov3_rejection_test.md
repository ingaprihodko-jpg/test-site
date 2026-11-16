---
name: project-ov3-rejection-test
description: "Тест «Ранний опыт отвержения» (ОВ3 Сценарии, Эрскин) на GC iscelenie-course.ru стр. 4795563 — форма, доп. поле, авто-смена призыва 30.10"
metadata:
  node_type: memory
  type: project
  originSessionId: 703081b6-e0f6-4976-8111-b97578f047f3
  modified: 2026-10-22T07:09:20.385Z
---

Тест из документа «Сценарии» (Google Doc 1RAeo6cvIwUNsR4-o_VNUINLgrBNhzpWRhv4OgyO7VK4, вкладки «ТЕСТ НА ГК ОВ3 РЕГА» и «… КУРС» — тело одинаковое, отличается только призыв). Код: `export/ov3-rejection-test-embed.html`, префикс классов `ovt-`.

- Страница GC: editor?id=4795563, адрес https://iscelenie-course.ru/scenarios/test, опубликована 2026-10-22. Блоки: b-a7ebb — HTML с тестом; b-411fa — форма (email, имя, доп. поле с плейсхолдером ovt_result), показывается перед результатом, как в [[project-lifepractic-matcher]].
- Доп. поле пользователя «ОВ3 Сценарии_тест отвержение_результат» (Строка) — пишется «N — диапазон. Название».
- Смена призыва (задача 2) встроена в код: до 2026-10-30 00:00 МСК — вебинар, после — курс «Выбрать тариф». Проверка: ?ovt_cta=web / ?ovt_cta=course.
- Ссылка на регистрацию (с 2026-10-23, от пользователя): freeweb3 с utm_campaign=none_ov3_scenarios_e.s._none (LINKS.web в коде). В комментарии документа была ошибочная ссылка на вебинар про РАС.
- Дедлайн отправки ссылки — 24.10.2026.
