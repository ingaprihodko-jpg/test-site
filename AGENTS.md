# AGENTS.md — f5game-site и соседние проекты Инги

Репозиторий с лендингами, встраиваемыми блоками для GetCourse (GC), рассылками и прототипами. Здесь работает несколько проектов: F5GAME, Life Practic, tsss.site (Tim Shtok Sound Studio), сайты экспертов.

## Как работать

- **Общаться по-русски**, включая промежуточные статусы.
- **Память проекта лежит в `docs/memory/`.** Начни с `docs/memory/MEMORY.md` (индекс, одна строка на заметку). Перед работой над проектом или площадкой прочитай нужные заметки целиком. Файлы называются `project_*` (проекты), `feedback_*` (правила от Инги и грабли), `reference_*` (справочники).
- **Скиллы-инструкции лежат в `.claude/skills/<имя>/SKILL.md`** — это обычные markdown-инструкции, читай их как руководства:
  - `gc-mailing` — Google Docs → черновики рассылок GC (Life Practic);
  - `tsss-mailing` и `tsss-mailing-check` — рассылки tsss.site и их проверка;
  - `gc-site` — сборка и проверка страниц GC (`qa.js`, `mk_embed.py`, `palette.md`, `rules.md`);
  - `impeccable`, `emil-anim` — дизайн и анимация интерфейсов.
- Если заметка называет файл, id страницы или функцию, **проверь, что они ещё существуют**, прежде чем опираться на них. Заметки отражают состояние на момент записи.
- Заметки писались под инструменты Claude Code (claude-in-chrome и др.). Если у тебя другой способ управлять браузером, суть правил та же, адаптируй приёмы.

## Жёсткие правила (от Инги, не нарушать)

1. **Только текст из ТЗ.** Ничего не выдумывать и не приукрашивать (`feedback_stick_to_tz_copy.md`).
2. **Типографика** (`feedback_typography_rules.md`): неразрывный пробел после коротких слов, без одинокого слова в последней строке (кроме заголовков), без точки после заголовков, 1–2 шрифта, иллюстрации «приземлять» на поверхность.
3. **Корректура без правки смысла** — только опечатки, пунктуация, типографика (`feedback_proofread_no_meaning.md`).
4. **В рассылках GC никогда не нажимать «Готово к отправке»**, даже если попросят (`feedback_never_ready_to_send.md`). Только черновики. Сегменты и ссылки из образца не менять (`feedback_gc_mailing_keep_sample.md`).
5. **UTM в рассылках ставит автор**, не ты.
6. **Экономь API/деньги:** предлагай дешёвый вариант, не гоняй дубли и «сухие» прогоны (`feedback_optimize_api_cost.md`).
7. Необратимые и внешние действия (отправка, публикация, удаление, платежи) — только после явного «да» Инги.
8. Пароли, токены и ключи в файлы не записывать.

## Главные грабли GetCourse

- На GC `html{font-size:10px}`: все `rem` сжимаются. В embed-экспортах **переводи rem → px** (`feedback_getcourse_rem_bug.md`).
- Общие имена классов (`.h1`, `.btn`, `.nav`…) и `body font-family` перебиваются CSS платформы: нужны уникальные имена и `!important` (`feedback_getcourse_class_collision.md`).
- Id колонок `builder*` временные. Используй стабильные `ltBlock*` и `nth-of-type`. Проверяй вживую до сдачи (`feedback_getcourse_block_css.md`).
- Scroll-reveal прячет страницу: `[data-reveal]` форсируй в `opacity:1`. Редактор кода не принимает JS `setValue`, нужны реальные нажатия клавиш (`feedback_getcourse_reveal_and_editor.md`).
- Вставка в Chrome через Cmd+V портит кириллицу (`feedback_chrome_paste_cyrillic_bug.md`). Правки блоков лучше делать через API (`reference_gc_block_api.md`).
- Буфер обмена общий: после вставки в CSS темы проверяй содержимое до «Сохранить» (`feedback_clipboard_shared_verify.md`).

## Карта проектов (подробности в `docs/memory/`)

| Проект | Где | Заметка |
|---|---|---|
| Тесты экспертов F5GAME (2 варианта) | `expert-tests-a.html`, `expert-tests-b.html` | `project_f5game_expert_tests_page.md` |
| Кабинет эксперта (2 варианта) | `expert-cabinet.html`, `export/expert-cabinet-*.html` | `project_expert_cabinet_page.md` |
| «Какой скандал!» | `skandal.html` | `project_skandal_cards_page.md` |
| Главная кабинета, 4 варианта | `export/cabinet-*-embed.html` | `project_cabinet_home_redesign.md` |
| Каталог библиотеки встреч | `export/library-catalog-*.html` | `project_library_catalog.md` |
| Подборщик Life Practic | `export/lifepractic-matcher-embed.html` | `project_lifepractic_matcher.md` |
| Лендинг «Система продаж» | `export/sales-system-embed.html` | `project_sales_system_page.md` |
| Лендинг «Чтец аудиокниг» (tsss) | `export/chtec-embed.html` | `project_tsss_chtec_page.md` |
| Лендинг «Незаменимые» | `export/irreplaceable-sale-block.html` | `project_irreplaceable_page.md` |
| Отрывок ОВ4, подарок, запись ОВ0 | `lp-*.html`, `export/lp-*` | `project_lp_*`, `project_gift_gaverdovskaya_short.md` |
| Гайды Ольги (PDF) | `guide/` | `project_olga_guides_pdf.md` |
| Рассылки GC (Life Practic и tsss) | скиллы выше | `project_gc_mailing_agent.md`, `project_tsss_mailing_*.md` |
| Потеря UTM у ОВ3 | `export/freeweb3-utm-forward.html` | `project_freeweb3_utm_loss.md` |
| Salebot «УТЕЧКА» | — | `project_salebot_utechka_funnel.md`, `reference_salebot_docs_archive.md` |

Папки: `export/` — готовые встраиваемые блоки для GC; `assets/` — картинки и логотипы; `old/`, `v2/`, `prototypes/` — прошлые версии и черновики (не править без запроса).

## Свежие заметки

Если появились новые факты о проектах, добавляй их в `docs/memory/` отдельным файлом (одна заметка — один факт, с блоками **Why:** и **How to apply:**) и одной строкой в `docs/memory/MEMORY.md`.
