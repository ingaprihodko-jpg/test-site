---
name: feedback-getcourse-rem-bug
description: "GetCourse sets html{font-size:10px}, breaking all rem-based CSS sizing when a page is embedded there — always convert rem to px in the embed export"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4afa1500-5f42-4968-b85d-85fd28ad1358
  modified: 2026-08-04T11:47:41.358Z
---

GetCourse's site theme (at least on f5game.site) sets `html { font-size: 10px }` instead of the browser default 16px. Any CSS on an embedded page that uses `rem` units (font-size, clamp() ranges, spacing) renders at 62.5% of the intended size once pasted into GetCourse — even though it looks correct on the standalone GitHub Pages version. This reads as "font is too small" and can also make blocks look misaligned/cramped since text wraps differently than designed.

**Why:** This bit twice on this project — first on the "Карта ролей" page, fixed by converting all rem sizes to px in `export/karta-roley-embed.html` (git commit "Convert all rem font sizes to px"). Then again on the "Экспертные тесты" page (`expert-tests-a.html`), diagnosed live on `f5game.site/expert-tests` via `getComputedStyle(document.documentElement).fontSize` → confirmed `10px`. Fixed the same way for `export/expert-tests-embed.html`.

**How to apply:** Whenever generating or updating a `export/*-embed.html` file meant to be pasted into GetCourse:
1. Keep the standalone dev file (e.g. `expert-tests-a.html`) using `rem` — it's fine there since GitHub Pages doesn't override root font-size, and rem is better for accessibility.
2. In the embed export, convert every `Xrem` token to its px equivalent at a 16px baseline (`Xrem × 16 = Xpx`) — a regex pass like `re.sub(r'([0-9]*\.?[0-9]+)rem', lambda m: f"{round(float(m.group(1))*16, 2)}px", html)` over the whole file handles this in one shot, including inside `clamp()`.
3. Also keep doing the other embed-only steps: absolute-ify local `assets/images/...` paths to the GitHub Pages URL, and add `!important` to base `body` font-family and `p` margin rules (GetCourse's own theme CSS otherwise wins those too).
4. **Generic class names need their OWN explicit `!important` rule, not just inheritance from `body`.** Found on the "Экспертные тесты" page: GetCourse's theme has its own `.prose` rule (almost certainly Tailwind Typography) that sets `font-family: Montserrat`. This beat our `body { font-family: Manrope !important }` — a rule that directly targets an element (`.prose`) *always* wins over an inherited value, no matter how many `!important`s are stacked on the ancestor; inheritance only applies when nothing targets the element itself. Since `.prose` is used for nearly all body copy on the page, this one collision silently wrecked the font on most paragraphs even after the rem→px and body-level fixes looked complete. Fix: give `.prose` its own explicit `font-family` in the dev file, and have the embed script append `!important` to that specific declaration too — same treatment as `body`/`p`.
5. **Don't trust a same-origin stylesheet scan to prove "no competing rule exists."** A `document.styleSheets` loop that reads `sheet.cssRules` throws (and gets silently skipped by a try/catch) for any stylesheet GetCourse loads cross-origin from their own CDN — so a check that "only finds our own rule" is not proof the host has none; it may just mean the host's rule was invisible to the script. Prefer checking `getComputedStyle(el)` directly on the live element for the properties that matter (font-family, font-size, margin, width) rather than trying to enumerate competing rules.
6. When a centered `.prose` paragraph still doesn't render centered after the above, don't chase the exact competing rule — just make that specific paragraph immune: `max-width: none !important; width: 100%; margin: 0 !important; text-align: center !important;` inline. This sidesteps whatever the host is doing to width/margin entirely.
7. After regenerating an embed export, verify live if possible: `getComputedStyle(document.documentElement).fontSize` should read `16px` (not `10px`), and `getComputedStyle(document.querySelector('.prose')).fontFamily` should read `Manrope, sans-serif` (not `Montserrat, serif`) on the actual GetCourse page.

Related: [[project_f5game_expert_tests_page]], [[feedback_typography_rules]]
