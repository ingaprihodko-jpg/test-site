---
name: project-tsss-bottom-banner
description: "Нижний баннер для учеников tsss.site: страница 3984294 (/page121) + тема 57651, как устроен и как менять картинку"
metadata:
  node_type: memory
  type: project
  originSessionId: c649d0e7-e79b-4794-91ee-a873850c3527
  modified: 2026-11-04T13:19:13.407Z
---

Баннер внизу сайта tsss.site. Тема «Баннер для учеников (Внизу сайта)» (layout 57651) скриптом грузит /page121 и вставляет первый видимый `.fixbanners .info-wrapper` в `.gc-main-content`. Страница-источник — editor?id=3984294, 6 текстовых блоков (common-banner: картинка 60px в круге, h3.banner-title, p.banner-text, кнопка .banner-link).

- Какой баннер кому — решает видимость блока по сегментам («База без учеников», «Все ученики»); `visibility[disabled]=all` = блок выключен.
- 2026-11-03: блок 1 (ltBlock2157342498) = «Большая распродажа в TSSS» + наушники, блок 2 (ltBlock2240682029) = «Закрытая онлайн-конференция «План выхода на рынок озвучки»» + микрофон; обе кнопки на web.tsss.site/birth с UTM gk/gkbaner/baner/crm. Видимость не трогали — пользователь решит по сегментам позже. Блоки «3 дня»/«2 дня» с июля ещё включены.
- Картинку загрузить: add-item-to-builder partType=image → клик по картинке → file_upload в input «Загрузить» → выбрать файл → взять hash из src → удалить элемент; ссылка `https://fs.getcourse.ru/fileservice/file/download/a/630580/sc/<sc>/h/<hash>.png`.

- 2026-11-04: стиль переделан (тёмная карточка 610px, золотая кнопка; CSS в export/tsss-bottom-banner.css, сохранён в теме 57651). В обоих баннерах картинка — чёрный шар «−60%» (tsss/assets/banner-sphere-60.png, обрезан в круг). Логотип — белый круг 68px.
- Картинку в блоке можно менять и без клика: взять `.info-wrapper` из DOM редактора, подменить src у `img.banner-logo`, отправить `update-param` (params[items/parts/text1/inner/text]).

Related: [[reference-gc-block-api]]
