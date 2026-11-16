---
name: project-f5game-expert-tests-page
description: "Context on the \"Экспертные тесты\" landing page project — two design variants, review workflow via forwarded Telegram screenshots"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4afa1500-5f42-4968-b85d-85fd28ad1358
  modified: 2026-07-30T12:02:42.816Z
---

Building a new landing page for **"Экспертные тесты"**, a one-day intensive by Анастасия Соликова (F5GAME brand) on 5 September, 10:00 MSK — teaching how to build audience-typing quizzes as a personal-brand/marketing tool. Price 9950₽ (was 45000₽). Full copy came from a client-provided ТЗ (spec) pasted directly into chat.

This is a second product landing page in the same repo as `index.html` (the "Карта ролей и интересов" page by Ольга Грищенко). Two files exist:
- `expert-tests-a.html` — the active/production direction, recolored to match the brand's pink/purple/green palette (same tokens as `index.html`) after initial lime/coral experiment was rejected.
- `expert-tests-b.html` — kept as an alternate visual direction (amber/rust/teal, dark-first hero) for comparison, not actively iterated on.

**How to apply:** All detailed design feedback in this project arrives as **screenshots of a Telegram conversation** the user forwards (their own conversation with a reviewer, avatar initials like "AC") — these are screenshots of screenshots with handwritten-style annotations (red boxes/underlines/"удаляем" labels) plus a short freeform comment. Treat the annotation + comment as the actual instruction; the surrounding chat UI (avatars, timestamps) is just context, not something to reproduce. When annotations are ambiguous (e.g. what a strikethrough or red box specifically targets), ask rather than guess — this has come up multiple times.

Site is deployed via GitHub Pages from `main` branch root (repo `ingaprihodko-jpg/test-site`), so any pushed `.html` file at root is instantly live at `https://ingaprihodko-jpg.github.io/test-site/<file>.html`.

Two brand mascot illustrations were sourced from another F5GAME property (`f5game-vibecoding` GitHub Pages site) and saved locally for reuse: [[reference_f5game_mascot_assets]].

Related: [[feedback-typography-rules]]
