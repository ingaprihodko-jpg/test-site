---
name: project-skandal-cards-page
description: Landing page for expert cards «Какой скандал!» by Ольга Грищенко — skandal.html in f5game-site repo
metadata: 
  node_type: memory
  type: project
  originSessionId: b457f92b-4f28-4932-85ad-a746b234da35
  modified: 2026-09-09T09:07:04.975Z
---

Sales landing page **`skandal.html`** in the `f5game-site` repo (deployed via GitHub Pages from repo `ingaprihodko-jpg/test-site`, main branch root → live at `https://ingaprihodko-jpg.github.io/test-site/skandal.html`).

Product: **экспертные карты «КАКОЙ СКАНДАЛ!»** by Ольга Грищенко — "как разрешить любой конфликт даже с самым сложным собеседником". Price **99 950 ₽** (was 275 000 ₽, −64%). Deadline countdown timer to **14 сентября 12:00 мск**. Gift block: course «Управление конфликтами», старт 28 сентября.

Copy source: Google Doc `1R171jz2uMTP-4QBz5vzAAAWuA_ZHKJ3Xv9dn4boPv_w`, section **«Сайт игры»** only. Doc has broken emoji encoding.

Built reusing `index.html` design tokens/components (pink/purple/green, navy sections, Unbounded + Manrope). Applied [[feedback-typography-rules]] and [[feedback-stick-to-tz-copy]].

**Images (all client-supplied, in `assets/images/`):**
- `hero-characters.png` — two arguing people w/ red devils (deck cover art), hero
- `intro-friends.png` — two laughing men, «Инструмент обучения» block; flat mid-torso crop hidden with a bottom `mask-image` fade
- `card-role.png` / `card-phrase.png` / `card-worldview.png` — 3 card covers, strip inside «Что дают экспертные карты»
- `skandal-box.png` — card box render, «Что входит в стоимость» block
- `olga-gift.png` — cut-out photo of Olga w/ pink gift box, gift block (absolutely positioned, hangs onto the block's bottom edge, no halo, no shadow)

Client style calls this session: images sit ON the block's bottom edge (align-self:end + transform, or absolute for gift so block height = text); halos (`.grounded::before`) removed on hero/intro/gift per client; gift text = exactly 2 type styles (Unbounded caps + Manrope).

**Gift block text (settled):** `.gift-caps` "ГЛАВНЫЙ ПОДАРОК" is `white-space:nowrap` (one line; a `@media(max-width:900px)` rule drops its font to `clamp(1.1rem,5.6vw,1.7rem)` so it still fits phones). No "для всех покупателей" line. The lead-in ("обучение на&nbsp;авторском курсе Ольги&nbsp;Грищенко") + the course name ("УПРАВЛЕНИЕ КОНФЛИКТАМИ", `clamp(1.15rem,2.3vw,1.6rem)`) BOTH sit on the one `.gift-badge` gradient plate, which is `display:inline-block; width:max-content; max-width:100%` so it hugs the text (NOT the column). `.gift-note` paragraphs sit off the plate: `.gift-note--after-badge` = 32px gap from plate, `.gift-note--accent` ("Старт курса 28&nbsp;сентября") = its own 14px paragraph gap. IMPORTANT: mk_embed's global `p { margin ... !important }` zeroes these — the script now re-asserts `.gift-note*` **and `.lede`** margins with `!important` in its overrides block. Any `<p>` with a custom margin needed for layout must be re-asserted there or it collapses to 17.6px on GC.

**Hero layout (settled):** `.hero .wrap` stays at `--max` (1140) like every section so the copy shares the page's left edge (client: text must line up with block 2). The illustration is `position:absolute` pinned `right:0` inside the relative `.wrap`, `width: min(600px, calc(min(100vw,1200px) - 545px))` (~600px on GC, client pushed it up over several rounds), bottom-anchored: `bottom: calc(-1 * clamp(36px,4.5vw,56px))` (= negative of `.hero`'s padding-bottom) + `top:auto; translate:0; align-items:flex-end`, so the figures' feet land exactly on the seam with the next section ("картинка на границе блоков визуально"). PNG `hero-characters.png` has ~0 empty space below the feet, so image-box bottom = visible feet. Drop-shadow softened to a contact shadow (`0 10px 14px`). `.wrap` min-height `clamp(370px,37vw,500px)`, `.hero-visual` z-index 3. Width `min(660px, calc(min(100vw,1090px) - 470px))` (~620 on GC) with H1 `clamp(2.2rem,4.8vw,3.2rem)` + text col `max-width:410px` — the GC block caps the row at ~1082px so the image can't be bigger next to the H1 without overlap; **cap the vw term at ≤1090 or it overruns the GC container** (learned the hard way — an uncapped `100vw` made the image cover «СКАНДАЛ!» live).

**Block 2 (intro) — redesigned** (client: "опять две картинки друг под другом так не пойдёт"). Was image-right side column → looked stacked under the hero's right-side art. Now: `.intro-grid { display:block }`, heading + prose + **2-column** `.bullet-list` on the left (`.intro-copy`), then ONE large **centred** illustration (`.intro-visual .grounded { max-width:760px; margin:0 auto }`) emerging from the section's bottom seam (`.intro-section { padding-bottom:0 }` + bottom-fade mask). Centred (not a side column) so it never reads as "another picture stacked on the right"; text stays left, clear of GC's corner badge. Mobile: bullets 1-col, image `max-width:380px` centred. — don't shrink it much or the picture collides with «СКАНДАЛ!» at ~1440px. Copy column `max-width:470px`, H1 clamp `2.6–4rem` (small so the text column stays narrow and the picture gets the rest). Hero padding `clamp(48px,6vw,68px)/clamp(36px,4.5vw,56px)`, `.wrap` min-height `clamp(340px,34vw,460px)`, image `translate:0 calc(-50% - 8px)` — client first said too tall, then "сильно урезал" after I cut to ~444; landed on **~517px on GC** (~584px on standalone 1440). The illustration must stay ≤ hero height or it bleeds into the gray section below (GC canvas ~1167px is narrower than the standalone, image is taller relative to hero there — always verify `img.bottom` vs `.intro-section` top at ~1167px width). Hero stacks at **1040px** (rest of page still 900). GetCourse caps the block at ~1097–1167px so the picture can't bleed wider/taller there.

**GetCourse embed: `export/skandal-embed.html`** — regenerate from `skandal.html` with the scratchpad script `mk_embed.py` (rem→px ×16, absolute image URLs, `!important` on every font-family/font-size, platform wrapper overrides). See [[feedback-getcourse-rem-bug]] + [[feedback-getcourse-class-collision]]. GetCourse page editor: `https://f5game.site/pl/cms/page/editor?id=4727965`.

**The GC page `f5game.site/scandal` has MORE THAN ONE block.** The big raw-HTML block (whole `skandal.html`) is one of them; there is also a **separate empty «Код» block reserved for the "Запись эфира" content, positioned before the gift section**, plus other blocks — the client said "остальные два не трогай". Do NOT add extra sections into the main block for content that has its own block. The webinar block = `export/webinar-recording-block.html` (self-contained dark section, `.wrec*` scoped classes, px units, «Смотреть эфир» → `https://f5game.site/video/scandal1-1`) — paste that into the reserved block, not into the main one.

Still open:
- **Buy button URL is a placeholder** `https://f5game.site/forma/pay/skandal` on the `[data-cta]` button; hero + closing buttons scroll to `#pricing`. Client to send real pay link.
- Layout variants for the «Что дают» block parked at `prototypes/skandal-block-variants.html` (3 options) — client reviewing, hasn't picked.

Local preview: `.claude/launch.json` → `f5game-site` (python http.server :8533).

Related: [[project-f5game-expert-tests-page]], [[reference-f5game-mascot-assets]]
