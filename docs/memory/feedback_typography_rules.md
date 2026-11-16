---
name: feedback-typography-rules
description: "Russian web-copy typography rules for f5game-site landing pages — nbsp hanging words, font-family limit, grounded illustrations"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4afa1500-5f42-4968-b85d-85fd28ad1358
  modified: 2026-11-06T06:49:30.087Z
---

Standing rules for any landing page in this project (f5game-site), to apply automatically without being asked each time:

1. **No hanging prepositions/conjunctions/pronouns at line end.** Short Russian function words (prepositions: в, с, к, о, у, а, до, за, из, от, по, при, для, без, над, под, про, через, между; conjunctions: и, а, но, что, чтобы, если, когда, или, же, ли, бы, то; pronouns: я, ты, он, она, оно, мы, вы, они, это) must never be left alone at the end of a wrapped line. Glue them to the next word with `&nbsp;` in the HTML text.
   **Why:** Client explicitly flagged this as a recurring typography defect to check on every page, not just fix once.
   **How to apply:** When writing or editing any visible copy in an HTML file, insert `&nbsp;` between these short words and the word that follows. A regex-based pass over text nodes (excluding `<script>`/`<style>` and tag attributes) is the fastest way — see the fix applied in `expert-tests-a.html` (git history, commit "Glue short prepositions/conjunctions/pronouns with nbsp...").

2. **Only 1–2 font families site-wide.** Don't let a page accumulate more than one heading font and one body font (currently: Unbounded for headings, Manrope for body, matching `index.html`). Also keep font *sizes* consistent within a component — don't pair a large heading-style number with a tiny caption label right next to it; match the label size to the surrounding body text (`.prose`, ~1.08rem) unless there's a clear hierarchy reason not to.
   **Why:** Client caught a mismatched-size label next to a big stat number and said to audit the whole site for this, not just that one spot.
   **How to apply:** Before shipping a new page or section, grep for `font-family` declarations and confirm only the two brand fonts appear; scan for one-off small `font-size` overrides that don't match the established type scale.

3. **Illustrations must not float in empty space — ground them.** A character/product illustration placed on its own (no card, no background) needs a visual anchor so it doesn't look like it's floating. First attempt was a blurred contact-shadow ellipse under the image — client rejected it as looking like a disconnected smudge, because these sticker-style character illustrations are cropped mid-body with no drawn "feet touching ground." The fix that worked: a soft radial color-tint halo *behind* the character (a `::before` circle glow centered on the image, tinted with the section's accent color) instead of a shadow *below* it — see `.grounded` utility class in `expert-tests-a.html`. Keep a `drop-shadow` filter on the image itself too.
   **Why:** Client's exact words: "картинки если ставим смотри чтобы они в воздухе не висели" (when we place images, make sure they don't hang in the air) — flagged as a repeat instruction, not a one-off. Then explicitly rejected the ground-shadow-ellipse version as "странно заземлены" (strangely grounded) for this illustration style.
   **How to apply:** For sticker/cropped character illustrations (no visible ground contact in the art), use the halo-behind-the-image approach, not a shadow-ellipse-below approach. A shadow ellipse only reads correctly when the illustration's own art shows feet/base actually touching a surface.
   **Applies everywhere — sites, PDF guides, covers (rule repeated 2026-11-06: «запиши себе чтобы человечки никогда не висели в воздухе»).** Characters must stand on something: put them flush to the page/block bottom edge, and when the art is cut off mid-leg, hide the cut behind a foreground shape (flames/colour blobs/ground band with higher z-index) — see the cover of guide/scandal-warmup.src.html (`.cover .flames{z-index:2}` over `.pair`). Never leave a figure ending in empty space.

4. **Every section's text must share ONE left edge down the whole page — the hero included.** The usual cause of a misaligned block is a section whose `.wrap` (or grid container) has a different `max-width` than the rest: e.g. the hero wrap widened to 1360px "to fit a bigger illustration" while all other sections use `--max` (1140px). Both are `margin: 0 auto`, so the wider one's content starts further left and the hero copy no longer lines up with the block below it. **Fix: keep one shared wrap width for all sections.** If an illustration needs more room, give it via the grid column ratio / the image's own `max-width` / a right-side bleed — never by widening that section's wrap. Do NOT try to patch it with a `padding-left` on the text column: inside GetCourse the block container is already capped (~1097px) so any viewport-based padding overshoots and pushes the hero text *past* the others.
   Optical-margin nudges (`margin-left: -0.0Xem` on a heavy display heading) were tried here and were the wrong call — the client wanted a literal shared indent, not a per-heading tweak. Only reach for an optical pull if a specific round-cap heading (С, О, Ф) still looks off *after* the wraps already match.
   Also drop any forced `<br>` inside running paragraphs (client repeatedly flags mid-sentence breaks as "разорвано / надо выровнять") and prefer `text-wrap: balance` on short subheads and `text-wrap: pretty` on prose.
   **Why:** Client's words: "почему здесь текст не выровнен по левому краю… подровняй первый блок и внеси в инструкции чтобы всегда правил", then "нет надо текст в первом блоке сместить правее чтобы он был так же как и во втором блоке такой же отступ" — explicitly asked for a standing rule.
   **How to apply:** Grep the page for `max-width:` on `.wrap` / section grid containers — they should all resolve to the same value (`--max`). Then measure rendered `getBoundingClientRect().left` of the eyebrow, H1, subline and the next section's first text node at a wide viewport (≥1400px) and confirm they match. See `.hero .wrap` in `skandal.html` (kept at `--max`, illustration sized via the `0.44fr 1.56fr` column split).

5. **No single word alone on the last line of any paragraph / list item / heading ("висячее слово").** Glue the last two words of every `<p>` and `<li>` with `&nbsp;` (script pass over text nodes, skipping tags), and also add `text-wrap:pretty` on those elements as a second layer. Do NOT glue big uppercase headings (h2/h3) — a glued pair like «ЭКСПЕРТНЫХ&nbsp;ПРОДАЖ» at 26–44px is wider than a phone and stretched every card off-screen (live bug 2026-10-22); use `text-wrap:balance` on headings instead, and keep `grid-template-columns:minmax(0,1fr)` on mobile grids. After any glue pass, check at 375px that no element is wider than its container.
   **Why:** Client flagged a lone «участником.» on the format block and said "запиши сразу себе чтобы одно слово не висело" — a standing rule, 2026-10-22.
   **How to apply:** Do it automatically on every page/block you build or edit, before publishing; check narrow (375px) and desktop widths.

6. **No period at the end of headings / display statements** (h1–h3, big standalone phrases like «Результат обучения» text set as a heading, plaques, button labels). Periods stay only inside normal body paragraphs.
   **Why:** Client removed the final dot in «…в самый горячий предновогодний сезон.» and said "тоже себе внеси" (2026-10-22).
   **How to apply:** Before publishing, grep for `\.</h[1-3]>` and similar heading-styled elements; strip the trailing dot.

Related: [[project_f5game_expert_tests_page]], [[project-skandal-cards-page]]
