---
name: project-sales-system-page
description: "«Система продаж в новой реальности» landing — GC page 4775076, embed export/sales-system-embed.html, prepay popups"
metadata:
  type: project
---

Landing for Ольга Грищенко's course «Система продаж в новой реальности» on f5game.site, GC **page id 4775076** (one raw-HTML block `b-e1261` + GC popup form blocks). Source: `export/sales-system-embed.html` (styled like expert-cabinet colors variant, `.sp` scope, gift-box image inlined as base64). Copy from two Google Docs (base text + later expanded program).

- All tariff buttons open GC popup form blocks via `data-popup="<block code>"` + a small script calling `window.ltShowModalBlock(code)` (wired + published 2026-10-21). Предоплата: Стандарт `b-75aba`, Профи `b-dfeb9`, ВИП `b-db923`. Купить: Стандарт `b-71bba`, Профи `b-59aeb`, ВИП `b-58799` — offers 8803808/09/11; page prices raised to match: 64 950 / 84 950 / 164 950 ₽ (old struck 110 000 / 150 000 / 300 000).
- To update the raw-HTML block without the clipboard (user copies things mid-flow), apply string replacements to `cm.getValue()` in JS and verify SHA-256 against the local file.
- Full-price offers: 8750326 / 8750338 / 8750344. Promo СИСТЕМА (−5 000 ₽, offers tagged «продукт_система продаж») is applied by GC on the payment page — GC lite forms have NO promo-code field type. User added the promo hint text in the form herself and said nothing more is needed.

Related: [[feedback-getcourse-reveal-and-editor]], [[feedback-chrome-paste-cyrillic-bug]]

2026-10-21 later: hero is centered (pills → eyebrow → caps «СИСТЕМА ПРОДАЖ» → «в новой реальности» → buttons Тарифы/#tariffs + Программа курса/#program), small hero text unified Manrope 14px/700 caps; hero image = superhero-over-city illustration (assets/images/sales-hero-superhero.webp, inlined). Added «запись премьеры» block (#premiere) before program, button → https://f5game.site/video/life. If Chrome window is minimized the tab reports innerWidth 0 and clicks/screenshots fail — ask the user to restore the window.
- Page now has 3 visible raw-HTML blocks: main `b-e1261`, author «Ведущая» `b-42239` (ltBlock2258265516, rebuilt from export/sales-author-block.html, scoped `.sp-author`; photo data-URI kept from user's original), footer `b-71e09` (user's, untouched). User-added blocks may ship unscoped global CSS (`*`, `body`, `section`, `.wrap`, `.about`) that clashes with `.sp` — restyle them scoped.
- Live slug: f5game.site/system. 2026-10-22: user edited the author block from a stale editor tab and it reverted to her original code (bundled full "Money Hypotheses" CSS incl. .hero/.program/section/h3 → program turned dark, module titles invisible). Re-applied scoped version with eyebrow «Автор и ведущая курса». If the program/hero look broken again, first check whether b-42239 contains `.about-photo` again.
- 2026-10-22 client (Ольга) design rules for this site: ONE font only (Manrope; headings 800 uppercase, body regular, base 18px), NO italics anywhere, NO green/yellow (palette: blue, red, raspberry #E31C79, white, dark purple; all highlights/pills raspberry), centered hero = every line centered, program modules strictly alternate light/dark (dark = 2 and 4), illustrations between long text runs (car art after program: assets/images/sales-car.webp). Green-jacket "about" illustration still on page — flagged.
- 2026-10-24: hero buttons didn't react to real clicks — the hero illustration's `::before` glow (large absolute circle) overlapped the buttons and swallowed clicks. Fix: `.hero-img{pointer-events:none}`, `::before{pointer-events:none}`, `.hero-btns{position:relative;z-index:3}`; anchor links scroll via JS (smooth, -16px). Test buttons with REAL clicks (computer left_click), synthetic dispatchEvent bypasses overlays. Promo-note under tariffs was removed by user after 23.10 deadline.
- 2026-11-09: added countdown «Цены вырастут через» under tariffs (`.sp-timer`, data-deadline 2026-11-14T00:00:00+03:00, hides itself after). User removed the «Запись премьеры» block from the main code before that (mirrored locally). Users edit this block directly — always LCS-diff editor content vs local before overwriting.
