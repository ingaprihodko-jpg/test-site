---
name: feedback-getcourse-class-collision
description: "GetCourse's own platform CSS silently overrides generic class names and body font-family in custom raw-HTML code blocks"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8dc8d4f8-5f2b-4234-896d-87c65017ce33
  modified: 2026-08-26T17:33:41.781Z
---

When a full custom page (own `<style>` block, own class names) is pasted into a GetCourse "code" widget (e.g. the "Денежные гипотезы" / hyposesis page, repo `ingaprihodko-jpg/test`), GetCourse's site-wide platform CSS (Bootstrap 3 utility classes + its own theme stylesheet) still applies underneath and can silently win the cascade:

1. **Generic class-name collisions**: names like `.h1`, `.h2`, `.btn`, `.btn-primary`, `.nav`, `.logo`, `.badge`, `.price`, `.day`, `.divider`, `.open` are real Bootstrap/GetCourse classes too. Fix: prefix all such classnames (e.g. `mh-` for this page) in both the CSS selectors and the HTML `class="..."` attributes — but do this with a script that only touches class-selector/class-attribute tokens (regex `\.(token)(?![\w-])` for CSS, and per-token replace inside `class="..."` for HTML), never a blanket `\btoken\b` replace — that also corrupts real HTML tag names like `<h1>`, `<nav>` into bogus custom elements.
2. **`body{font-family:...}` alone isn't enough**: GetCourse wraps the whole custom code block in its own `.lite-page.block-set` (inside `.lt-raw-html`/`.lt-block-wrapper`) which has its own explicit (non-`!important` but higher-specificity, later-loaded) `font-family:Montserrat` rule sitting *between* `body` and the page content. Our own `body{font-family:Inter!important}` only wins for the literal `<body>` element — everything inside still inherits Montserrat from that wrapper. Fix required **both**: `body{...!important}` *and* `.lite-page.block-set,.lt-raw-html,.lt-block-wrapper{font-family:...!important}`.

**Why**: found by diffing computed `font-family`/`font-size`/`font-weight` on the live GetCourse page against the reference build on GitHub Pages, then walking `getComputedStyle` up the DOM parent chain to find exactly which ancestor first flips to the platform font.

**How to apply**: any time a custom-built landing page's fonts/sizes look "wrong" or "cut down" only on the live GetCourse page (not in the local build), suspect this class-collision + wrapper-font-family pattern first. See [[feedback_getcourse_rem_bug]] and [[feedback_getcourse_block_css]] for the other two known GetCourse-platform gotchas on this project.

3. **`.block-set p{margin:0}` (специфичность 0,1,1) перебивает одиночные классы** вроде `.ch-eyebrow{margin-top:64px}` (0,1,0) — все отступы у `<p>` молча обнуляются (найдено 2026-10-16 на tsss.site/audiobook-narrator). Фикс в embed-скрипте: префиксовать каждое правило `.ch-xxx` → `.ch-root .ch-xxx` (0,2,0), а общий сброс писать как `.ch-root :where(h1,h2,p,ul,li){...}` в самом начале стилей. Проверка: `getComputedStyle(el).marginTop` на живой странице.
