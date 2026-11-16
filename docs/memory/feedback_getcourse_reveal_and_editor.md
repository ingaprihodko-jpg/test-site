---
name: feedback-getcourse-reveal-and-editor
description: "Two more GetCourse gotchas — scroll-reveal animations hide most of the page, and the code-block editor ignores JS-driven setValue"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e43405b0-4525-4e8e-8e6e-63a544946cee
  modified: 2026-09-07T14:13:00.621Z
---

Found while getting `skandal-embed.html` (page id 4727965, `f5game.site/scandal`) working live inside a GetCourse raw-HTML code block:

1. **IntersectionObserver reveal-on-scroll breaks on GetCourse.** A `[data-reveal]{opacity:0}` → JS-adds-`.is-visible` pattern only revealed the 2–3 above-fold blocks; the other ~20 stayed at `opacity:0`, so most of the page was blank. GC's scroll container / lazy render defeats the observer. **Fix in every embed export:** append `[data-reveal]{opacity:1 !important;transform:translateY(0) !important;}` to the style block (the `mk_embed.py` scratchpad script does this). Don't also force `transform:none` if any `[data-reveal]` needs a transform.

2. **GetCourse also re-injects `data-reveal=""` onto plain `<div class="hero-visual">`** even when the saved source has no such attribute. So positioning an illustration with `transform: translateY(...)` gets clobbered by `[data-reveal].is-visible{transform:translateY(0)}`. **Fix:** position with the independent `translate:` property instead of `transform:` — the reveal rule sets `transform`, not `translate`, so `translate` survives. Reset with `translate:none` in mobile media queries.

3. **Updating the GC code-block (CodeMirror modal) via automation — the working recipe.** `cm.setValue()` alone does NOT persist (Save silently reverts, no "Опубликовать изменения" button). `navigator.clipboard.writeText` / `execCommand('copy')` both fail (CDP timeout / blocked). What WORKS: (a) mouse-`left_click` inside the CodeMirror text area to give it real focus, (b) `cm.setValue(freshEmbed)` via JS, (c) a genuine keystroke sequence — `key: ctrl+End`, `type: " "`, `key: BackSpace` — which trips GC's dirty flag, (d) click "Сохранить", (e) "Закрыть", (f) verify `.lt-raw-html` innerHTML has your markers + "Опубликовать изменения" button is now visible, (g) click "Опубликовать изменения", wait for the "Страница опубликована" toast. Then verify on `f5game.site/<slug>` (GC caches ~minutes; use `getComputedStyle`/element checks, and note `document.documentElement.outerHTML` dumps get BLOCKED by the tool's safety filter — check specific elements instead).

4. **Popup blocks & editor dialogs.** A GC popup ("всплывающий") block has `data-code="b-xxxxx"`; open it from raw HTML with `window.ltShowModalBlock('b-xxxxx')` (hash links like `#b-xxxxx` do nothing). Deleting a form field triggers a native `confirm()` that freezes the CDP tab — set `window.confirm=()=>true` before clicking the trash icon. Re-check the clipboard right before Cmd+V (`pbpaste | shasum`) — the user copying something mid-flow replaced the payload once. Before publishing, list all `[id^=ltBlock]` blocks: publishing ships the user's other unpublished drafts too.

Related: [[feedback-getcourse-rem-bug]], [[feedback-getcourse-class-collision]], [[feedback-chrome-paste-cyrillic-bug]], [[project-skandal-cards-page]]

4. **(2026-10-15, tsss.site стр. 4785305 «Чтец аудиокниг»)** Боковая панель «Настройки» HTML-блока (textarea «Значение» + «Сохранить и закрыть») — надёжный путь: искать кнопки через `find` после hover по блоку, НЕ по координатам (при смене размера окна клик по координатам открыл модалку CodeMirror, и «Сохранить» там молча не сохранил). Проверка после сохранения: искать свой маркер в `.lt-raw-html style`.
5. **Отступ слева 70px у администратора** — это `.gc-main-content.with-left-menu` под админ-меню GC; у гостей класс `no-menu`, отступа нет (проверка: `fetch(location.pathname,{credentials:'omit'})` и класс `.gc-main-content`).
