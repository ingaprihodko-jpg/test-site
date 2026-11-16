---
name: project-tsss-mk-personazhnost
description: "Лендинг МК «Режиссура сцены и персонажность» (TSSS) — tsss/mk-personazhnost.html, текст из Google Doc 1SW6PLlrK0V70e9UYv5-CP0nOEG6ITd1eQk937D6Ml_E"
metadata:
  node_type: memory
  type: project
  originSessionId: 254980b0-02e3-405b-b948-8aa46913a5c7
  modified: 2026-10-26T16:00:45.112Z
---

Игровой мастер-класс «Режиссура сцены и персонажность» для Tim Shtok Sound Studio. Начат 2026-10-26.

- Текст — Google Doc 1SW6PLlrK0V70e9UYv5-CP0nOEG6ITd1eQk937D6Ml_E («Поектировка МК Персонажность»). Цена 5 500 ₽ (зачёркнута) → 3 900 ₽.
- Стиль — баннер заказчика: чёрный + янтарное золото, Montserrat, золотые точки слева. Тот же каркас, что у «Чтеца» ([[project-tsss-chtec-page]]).
- Файлы: `tsss/mk-personazhnost.html` (standalone), `tsss/assets/mk-hero.webp` (фото микрофона, вырезано из мобильного баннера), `tsss/assets/mk-banner-ref.webp` (десктоп-баннер для сверки).
- Две карточки преподавателей (Антон Гусаков, Тим Шток) — фото пока заглушки. Кнопки ведут на `#form` — заглушка, пока нет формы GC.
- GC: tsss.site, editor?id=4802204 «[САЙТ] МК Режиссура сцены и персонажность», один HTML-блок ltBlock2258985630 (поле «Значение» в боковой панели «Настройки»). Embed: `export/mk-personazhnost-embed.html`, сборка скриптом mk_embed.py (scratchpad сессии 254980b0; логика как у «Чтеца»: префикс mk-, .mk-root, base64). Публичный адрес tsss.site/directing. Опубликована 2026-10-27 «как есть» по просьбе пользователя; формы на странице пока нет, добавят позже.
- Вставка в GC: кириллицу в HTML-части перевести в &#NNNN; → чистый ASCII, тогда pbcopy + Cmd+V в textarea не портит текст (сверять SHA-256).

- Вариант Б (2026-10-27): `tsss/mk-personazhnost-b.html` → `export/mk-personazhnost-b-embed.html`, GC стр. 4802775 «…вариант 2», блок ltBlock2259057956, опубликован 2026-10-27, адрес tsss.site/page543. Первый экран — один в один с баннерами: размеры в долях ширины баннера (десктоп 2000×833 → --u, мобильный 1311×2000 → --m, до 767px), строка у логотипа шрифтом Inter, точки вырезаны с баннеров (assets/mk-dots-d.webp, mk-dots-m.webp). В редакторе GC у админа шрифт кажется на ~5% крупнее из-за левого меню (vw считается от окна) — у гостей совпадает.
- 2026-10-27 клиент выбрал вариант Б: он же теперь на tsss.site/directing (стр. 4802204, блок ltBlock2258985630), вариант А там заменён (копия — export/mk-personazhnost-embed.html). Фото преподавателей стоят: assets/mk-anton.webp, mk-tim.webp. Страница 4802775 (/page543) осталась со старой версией Б без фото.
- Форма GC на /directing: блок ltBlock2259170693 (код b-993ed) — поля email/имя/телефон, кнопка «Записаться», заголовок «Забронировать участие». Стили формы — tsss/mk-personazhnost-b-form.css (из export/chtec-form.css), сборщик сам дописывает их в HTML-блок без комментариев (кириллица в <style> ломает вставку). Кнопка в билете ведёт к форме: сборка `python3 mk_embed.py <repo> ltBlock2259170693 mk-personazhnost-b`. Заголовок формы правится кликом по тексту (redactor), не через шестерёнку.
- Буфер обмена часто перебивает пользователь — pbcopy и вставку слать в одном сообщении, всегда сверять SHA-256 активной textarea перед сохранением.
- Сборщик mk_embed.py: `python3 mk_embed.py <repo> form [имя-файла-без-.html]`, кладёт рядом *-ascii.html для вставки.

**Why:** чтобы следующая сессия знала, где лежит лендинг и что в нём временное.
**How to apply:** для переноса в GC повторить схему «Чтеца»: префикс классов, base64 картинок, без reveal, rem→px.
