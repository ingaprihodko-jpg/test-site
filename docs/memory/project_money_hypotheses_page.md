---
name: project-money-hypotheses-page
description: "Денежные гипотезы" landing page lives in a separate repo (ingaprihodko-jpg/test), not f5game-site or f5game-landing
metadata:
  type: project
---

The "Денежные гипотезы" ("Money Hypotheses") intensive landing page for Olga Grishchenko is a single `index.html` in its own repo `ingaprihodko-jpg/test` (not cloned locally by default — clone with `gh repo clone ingaprihodko-jpg/test` into `/Users/inga/test`), deployed via GitHub Pages at `https://ingaprihodko-jpg.github.io/test/` from the `main` branch.

It is also embedded as a full custom HTML/CSS/JS code block in GetCourse at `https://f5game.site/pl/cms/page/editor?id=4713570` (public URL `https://f5game.site/site/hyposesis`), edited by opening the "Стиль" toolbar button on the page, which opens a CodeMirror editor containing the *entire* HTML document as one code block (not split into separate GetCourse block-CSS fields the way [[feedback_getcourse_block_css]] describes for other pages).

**Why**: this is a distinct project/repo from `f5game-site` (which hosts "Карта ролей и интересов" and the expert-tests pages) and from `f5game-landing`. Easy to miss since all three share the same GetCourse account/site.

**How to apply**: when asked to fix or sync anything about the "Денежные гипотезы" page, look in `/Users/inga/test` (or reclone), not in `f5game-site`. After editing, `git push` to `ingaprihodko-jpg/test`, then push the same fixed `index.html` into the GetCourse code block (see [[feedback_chrome_paste_cyrillic_bug]] for the paste workflow) and click both "Сохранить" and the separate "Опубликовать изменения" button — saving alone leaves it as an unpublished draft.
