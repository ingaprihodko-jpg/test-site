---
name: project-expert-cabinet-page
description: "«Экспертный кабинет» GetCourse landing — two variants split across two page ids, colors-only edit requests"
metadata:
  node_type: memory
  type: project
  originSessionId: 1eda3900-0000-0000-0000-000000000000
  modified: 2026-09-30T06:44:43.135Z
---

Landing for **«Экспертный кабинет»**, a two-day intensive by Ольга Грищенко (29 Oct + 5 Nov, 18:00 мск, 31 950₽). Copy came from a Google Doc, built directly as HTML blocks on GetCourse (no separate dev file needed at first, but local copies are kept in the repo for diffing).

Two visual variants were built, each now living on its **own** GetCourse page:
- `expert-cabinet.html` (repo root) — the "ek" variant: cream/brass palette, Cormorant Garamond + Manrope. Lives on **page id 4749923**.
- `export/expert-cabinet-embed.html` — the "pj" variant: F5GAME project palette (purple/raspberry/lime), Unbounded + Manrope. Lives on **page id 4749278**.
Both started as two blocks on one page (4749278); the user later split them onto separate pages herself.

When asked to "keep this variant but change to our colors, only colors, keep font/layout/everything else" — this means: swap ONLY the CSS custom-property values at the top of the `<style>` block (`--cream/--paper/--ink/--ink-soft/--brass/--brass-dark/--blush/--line` for the ek variant), leave every selector/property/HTML/copy untouched. Mapping used for the ek→project-colors pass: cream→`--paper` #f8f3ea, paper→`--white` #fffdf8, ink→`--ink` #1b1023, ink-soft→`--ink-soft` #3a2c46, brass→`--raspberry` #E31C79, brass-dark→`--pink-deep` #b12d75, blush→`--purple-light` #b79cff, line recomputed as `rgba(27,16,35,.14)` (same alpha, new ink RGB). Saved as `export/expert-cabinet-colors-embed.html`. Also applied the known `.row`→`.line` / `.small`→`.sm` class-collision fix (see [[feedback_getcourse_class_collision]]) since this was a fresh block, not yet verified live.

Related: [[feedback_getcourse_rem_bug]], [[feedback_getcourse_block_css]], [[feedback_stick_to_tz_copy]]
