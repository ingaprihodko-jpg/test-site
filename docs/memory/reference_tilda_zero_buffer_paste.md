---
name: tilda-zero-buffer-paste
description: "Tilda Zero Block — создавать/править элементы через буфер localStorage tn_store_buffer__copy-paste + elem__paste(), SBS-анимация по брейкпоинтам"
metadata:
  node_type: memory
  type: reference
  originSessionId: 728da5f8-d3dc-4dd1-8427-0a3948118bda
  modified: 2026-11-11T09:18:11.185Z
---

Zero Block редактор Тильды (tilda.ru/zero/?recordid=…&pageid=…):
- Cmd+A, Cmd+C кладёт JSON всех элементов в localStorage `tn_store_buffer__copy-paste` ({res, data:[{id, props}]}); читать поля с заменой `=`→`:` в выводе, иначе javascript_tool блокирует как «query string».
- Правка: меняем props (новые id), пишем обратно в localStorage, вызываем `elem__paste()` — вставляются наверх, порядок слоёв двигать Cmd+[ ; старые удалять через панель слоёв (Cmd+клик).
- Адаптив: ключи `left-res-640`, `fontsize-res-340` и т.п. (брейкпоинты блока смотреть по ключам).
- Пошаговая анимация: sbsevent (intoview/blockintoview/scroll/hover/click), sbsloop 'loop', sbsopts = массив шагов {ti,mx,my,sx,sy,op,ro,ea,dt}, ea '' = linear; есть `sbsopts-res-640/340`. На мобильных SBS не играет без `animmobile:'y'`.
- Предпросмотр: tilda.ru/page/?pageid=…&projectid=…&previewmode=yes (иконка телефона = 360px).
- Применено: tsss стр. 365479509, бегущие ленты «СКИДКА 60%» на первом экране (ноябрь 2026).
