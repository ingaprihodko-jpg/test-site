---
name: reference-gc-block-api
description: "Правка блоков GetCourse запросами из редактора — тексты, удаление/добавление элементов, HTML/CSS-блоки, без кликов и буфера"
metadata:
  node_type: memory
  type: reference
  originSessionId: 52fedda6-5fbe-4562-ae79-1b4c6a7458b1
  modified: 2026-11-03T07:12:49.545Z
---

Проверено 2026-11-03 на iscelenie-course.ru (стр. 4813210), из javascript_tool в открытом редакторе (jQuery `$.post` сам добавляет сессию GC):

- Текст элемента: `$.post('/pl/lite/block/update-param/?id=<blockId>', {'params[<data-param>/inner/text]': '<p>…</p>'})`. data-param берётся из `[data-param]` элемента (вида `items/parts/field52096`). HTML/CSS-блок: param `rawValue`. Кириллица не портится, буфер не нужен.
- Удалить элемент: `$(item).find('.delete-item-link').trigger('click')` (сначала `window.confirm=()=>true`) → delete-item-from-builder.
- Добавить элемент: `$.post('/pl/lite/block/add-item-to-builder?id=<blockId>&path=items&partType=image|countdown|…&afterItemName=<field>')`. Через меню «+» опасно: меню запоминает прошлый блок.
- Блок: перемещение — `.btn-move-down` через trigger работает; «Дублировать» и «Сохранить» в модалках — только настоящим кликом. Удаление блока — `.btn-delete` trigger.
- Видимость блока: `/pl/lite/block/visibility-settings?id=` — нужен и radio `visibility[enabled]=group`, и select группы.
- Большие файлы: создать `input[type=file]`, `file_upload`, прочитать `file.text()`, сверить SHA-256, отправить update-param.
- В Redactor-элементах «+» стоит по центру — клик по центру открывает меню добавления, а не текст.

Related: [[feedback-getcourse-reveal-and-editor]], [[feedback-getcourse-block-css]]

**Стиль блока без кликов (2026-11-09, урок 350436904):** `$.post('/pl/lite/block/settings?id=<id>')` → `data.html` (форма) + `data.css`. Разобрать DOMParser, взять поля `blockParam[viewBlock*|textAlign|blockFont*|blockPadding*|block*Color|blockCssClass|blockCover|box|isModal|blockFlex]`, поменять, `$(inputs).serializeArray()` + `{name:'css'}` → `$.post('/pl/lite/block/save-settings?id=<id>', $.param(arr))`. Окно «Стиль» через trigger открывается криво — не использовать. На iscelenie-course CSS аккаунта ставит `.col-md-12{padding:0!important}`: у коробки на всю ширину (0/12) отступы задавать в CSS блока с !important.
