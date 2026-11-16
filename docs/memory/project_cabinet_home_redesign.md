---
name: project-cabinet-home-redesign
description: "Редизайн главной кабинета f5game.site/teach/control/stream — 4 варианта-блока A/B/C/D, только прототипы, на GC не вставлять"
metadata:
  node_type: memory
  type: project
  originSessionId: 3ede2947-a2f1-4bae-a4b6-7088c7996476
  modified: 2026-10-15T16:55:25.191Z
---

Главная кабинета учеников f5game.site/teach/control/stream («Список тренингов»). 2026-10-15 собраны 4 варианта блока «HTML-код» (без <script>, GC их вырезает):
export/cabinet-pult-embed.html (A «Пульт игрока»), cabinet-board-embed.html (B «Игровое поле»), cabinet-library-embed.html (C «Афиша и библиотека», CSS-фильтры на radio), cabinet-deck-embed.html (D «Колода»). Общее превью: prototypes/cabinet-variants-preview.html.
Пользователю больше всего понравилась идея «Игрового поля» → добавлены вариации поля: cabinet-board-path-embed.html (B2 дорожка), cabinet-board-comic-embed.html (B3 комикс), cabinet-board-cards-embed.html (B4 карты-схемы с переворотом). Референс стиля от пользователя: Genially «Управление конфликтами» https://view.genially.com/6acf94f0ce6423947cc0088b (комикс, растр, жёлтые звёзды-взрывы, номерные кружки уровней, сетка «карт-схем»).
Новая разбивка по категориям: B5 cabinet-board-zones-embed.html (5 тем) и B6 cabinet-board-path5-embed.html (5 этапов пути ученика) — оба генерируются одним скриптом из списков тренингов с id; названия тем и этапов придумала я, пользователь их ещё не утверждал. Внутри «Обучающих курсов» 62 подраздела, «Мастер-классов» 28, «Бонусов» 65, есть пустые папки и дубли (тест-копии).
B7 cabinet-board-ring-embed.html — доска как в Монополии (20 клеток-тренингов по 5 темам, 4 угла, в центре блоки: ход/события, CSS-кубик со случайным МК, «Мой уровень» ДЕМО под шкалу достижений GC, легенда, «Продолжить обучение»). Генератор — scratchpad build_ring.py (не в репо).

**Why:** пользователь просил «не редактируй там, сам собери прототип» — на живой GC-странице ничего не менять без явной просьбы.
**How to apply:** правки делать в файлах export/, превью пересобирать; ссылки «Узнать о новых запусках» и служебных кнопок — заглушки #ССЫЛКА-…, ждём адреса от пользователя. События берутся из [[events-calendar]] (export/events-calendar-embed.html). См. также [[feedback-stick-to-tz-copy]].
