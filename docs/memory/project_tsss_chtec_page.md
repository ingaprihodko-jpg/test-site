---
name: project-tsss-chtec-page
description: "Лендинг «Чтец аудиокниг» (TSSS) — GC tsss.site стр. 4785305 (/audiobook-narrator, раньше /page534), исходники и сборка, разрешение публиковать без вопроса"
metadata:
  node_type: memory
  type: project
  originSessionId: 74a89f79-ea71-40e2-8a69-5446f421b6c8
  modified: 2026-10-15T15:43:58.830Z
---

Лендинг курса «Чтец аудиокниг» для Tim Shtok Sound Studio, стиль — с баннера заказчика (тёмно-синий + золото, Montserrat).

- Текст — Google Doc 1Yd7pk0RAfI_ASA4m55rYGgfpRk4kftCTNJ6eBP3Psec («Первая. Проектировка. Чтец Аудиокниг»). Сверено построчно 2026-10-15.
- Файлы: `tsss/chtec.html` (standalone), `tsss/assets/chtec-books.webp` (книги с наушниками с баннера дизайнера, тонированы под палитру; микрофон chtec-hero.webp больше не используется), `tsss/assets/tsss-logo.png`, `export/chtec-embed.html` (для GC: классы с префиксом `ch-`, картинки base64, без reveal).
- GC: tsss.site, editor?id=4785305, один HTML-блок ltBlock2257085130, публичный адрес tsss.site/audiobook-narrator (раньше /page534).
- **2026-10-15 пользователь разрешил публиковать правки по этой странице без отдельного вопроса.**
- Фото преподавателя: tsss/assets/chtec-teacher.webp (4:5). Обе кнопки «Забронировать участие» ведут к форме GC ltBlock2257225622 (стили формы — scratchpad form.css, копия export/chtec-form.css). В форме (2026-10-20) есть позиция «Чтец аудиокниг» 25 900, кнопка «Оплатить участие» и 3 галочки согласия — всё оформлено стилями из export/chtec-form.css. Обновлять стили формы: в textarea блока заменить кусок от «/* форма GC» до </style>.

**Why:** чтобы следующая сессия не спрашивала про публикацию повторно и знала, где что лежит.
**How to apply:** правки вносить в chtec.html → пересобрать embed → загрузить в блок через панель «Настройки» (см. [[feedback-getcourse-reveal-and-editor]]) → опубликовать сразу.
- Сборка: шаблон и скрипты в scratchpad сессии 74a89f79 (template.html → build.py → tsss/chtec.html → embed.py → export/chtec-embed.html); если их нет — править tsss/chtec.html и повторить шаги embed (префикс .ch-, .ch-root перед каждым правилом, base64 картинок, стили подвала GC).
- Hero: до 900px — мобильная раскладка по баннеру (текст по центру, книги снизу); отступы секций 52/48/36px.
