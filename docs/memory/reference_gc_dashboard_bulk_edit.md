---
name: reference-gc-dashboard-bulk-edit
description: "Как массово править сегменты дашборда GC tsss.site через форму вкладки «Воронка», проверка задвоения и группа исключения воронки 4397610"
metadata:
  node_type: memory
  type: reference
  originSessionId: e7f44936-2ce8-45b3-b397-334a9582b443
  modified: 2026-11-03T07:42:43.157Z
---

Список сегментов: `/pl/logic/funnel/update?id=<дашборд>`, строки `.part-row`. Сегмент: `/pl/logic/funnel/update-segment?id=<partId>`.

Задвоение: у сегмента бывает «Базовый сегмент» (`ParamsObject[base_part_id]`). Итоговый фильтр = базовый + собственные условия. Диалог-шестерёнка на Панели показывает уже объединённое правило и при сохранении вписывает базовые условия в сам блок. Поэтому `save-part` для правки не использовать, см. [[feedback-gc-dashboard-funnel-tab]].

Собственное правило лежит в HTML страницы сегмента: `rulePlugin({... "rule":{...}`. Скрытого поля `rule` в сыром HTML нет, его создаёт JS.

Сохранение: POST на `update-segment?id=<partId>`, urlencoded, поля `saveConversions=1`, `Segment[title]`, `ParamsObject[base_part_id]`, `rule` (JSON), `ParamsObject[importance]`, `ParamsObject[angles]`. Успех — статус 302.

Проверка после правки: для каждого блока сравнить дерево собственного правила с исходником и итоговое правило на Панели (JSON в скрипте `/pl/logic/funnel/dashboard?id=…`, ключ `report.rule`), посчитать повторы id предложения и группы.

Сборка и проверка правила без сохранения: на странице сегмента `$('#logicRulePluginw1').data('gc-rulePlugin')` → `getRule()`/`setRule(obj)`, счётчик «Под правило попадает» пересчитывается сам. Форматы: тег заказа `{type:'deal_tag',params:{value:{selected_id:[id]}}}`, менеджер `deal_manager_id`, создан клиентом `{type:'deal_created_by_client_new',params:{value:{checked:0}}}`, предложения по тегу `{type:'deal_offer_id',params:{value:{selected_id:[],selected_tags:['…'],all_object_with_tags:true},valueMode:''}}`, «ИЛИ» — andrule с `mode:'or'`, «НЕ» — `inverted:1` (работает и на группе).

Справочники: теги заказов `/pl/tag/by-object-type?asModelList=1&objectTypeId=17` (предложений — 5), менеджеры `/sales/control/participant/managerList`. Все предложения, включая неактуальные: POST `/pl/logic/context/select-object?page=N` с `context=OfferContext&searchStr=…&archived=` (список `/pl/sales/offer/index` показывает только актуальные).

Исключение воронки: группа `ПЛАТФОРМА | В воронке`, id 4397610, правило `user_ingrouprule` с `inverted:1` внутри `deal_usercontext`.

Длинные циклы запускать без await и опрашивать результат: синхронный JS падает по таймауту 45 с.

Урок «Ответ принят»: `deal_usercontext` → `{type:'user_visitlessonrule',params:{value:{selected_id:'<id подмодуля, где лежит урок>'},lessonId:{selected_id:'<id урока>'},checkerType:{selected_id:'accepted'},status:{selected_id:null}}}` (className `app::modules::user::models::rule::VisitLessonRule`). Тренинг — именно подмодуль, иначе «Устаревшее значение». checkerType: reached/enter/answer/accepted и not_*.

Удаление блока: GET `delete-segment?id=` лишь показывает подтверждение, удаляет POST с `do_delete=1`. Массовое удаление классификатор блокирует — спрашивать пользователя.

Текстовые блоки Панели: шестерёнка `.config-button` → модалка с `#text_block_input`; править по одному, ждать модалку с нужным значением (иначе пишется в чужой блок).

Дашборд «Саунд-дизайн» 1710112 (копия «Озвучки 2.0» 1706187): колонки Блоки 1-3 / Блок 1 / Блок 2 / Блок 3 по тегам rate-Блок…; в SD заморозка по продуктам, поэтому «активны» = активный продукт И НЕТ замороженного.

Новая группа блоков по метке (дашборд 1709223, ноябрь 2026): создание POST `/pl/logic/funnel/create-segment?funnelId=<id>&contextName=DealContext` (те же поля, новый id в URL ответа). Схема группы: «Регистрации X» (база «Реги на веб» 31007531, UTM-условия) → «Регистрации учеников X» (база = «Регистрации X»); «Участия/Заказы/Оплаты X» (база = технический блок «Рега с меткой X», importance 0, копия «Рега с баннера гк» с заменой UTM). Остальные правила — копии группы MAX. Поля UTM: 10600126 source, 127 medium, 128 campaign, 129 content, 130 term, 131 group.
Порядок во «Воронке»: переставить `.part-row` в DOM и вызвать `inst._trigger('update')` у sortable.
Панель (gridstack `$('.grid-stack').data('gridstack').update(el,x,y,w,h)`) сама шлёт save-part только с position — правило не трогает. Вид блока (viewType table, metrics/dimensions, comment): `ajaxCall('/pl/logic/funnel/save-part?id=',{params:{viewType,comment,contextName,gaugeMax,dataSourceOptions:report}})`, где в report.rule и report.params.rule подставить СОБСТВЕННОЕ правило блока (иначе задвоение). Заголовок группы — кнопка «Добавить текст», затем сдвинуть.

ВАЖНО: `deal_userproduct` смотрит только продукты, выданные ЭТИМ заказом (у человека с двумя заказами условия расходятся по заказам → он попадает в несколько колонок). Для «у пользователя есть продукт/статус» — `deal_usercontext` → `user_hasuserproduct` (className LinkedContextRule) → andrule(`userporduct_statusrule`, `userproduct_productselect_rule`). ИЛИ — andrule с mode:'or'.
Дашборд 1710112 (ноябрь 2026, правки Лады Зиминой): колонки по доступам — Все 3 блока (31037270: Б3 и (Б1 или Б2)), Только Блок 3 (297), Блоки 1-2 (286: Б2 и не Б3), Только Блок 1 (277); база всех = «Всего купили» 31037259. Продукты: Б1 4337861/4337874/4503226/4503229, Б2 4337864/4337875/4503236, Б3 4337867/4337876/4503242/4503237. Строки: заморозка = есть freeze; активны = есть active и нет freeze; «Обучение завершено» (бывш. «Активны + ОС») = есть finished, нет active/freeze. «Дошли до конца» = «Ответ принят» на последнем задании блока. Статус not_started на продуктах без ДЗ есть почти у всех — в заморозку не включать.

Подсчёт ЛЮДЕЙ, а не заказов: сегмент создавать с `contextName=UserContext`, правило `user_hasdealrule` (className app::modules::user::models::rule::HasDealRule) с linkedRule = предложения + `deal_status` ['payed','part_payed']; «НЕ» — inverted:1. Процент: при создании `CalcConversion[]=<id базового сегмента>`. Пример: дашборд 1711629 «ПОДКАСТ | Покупатели по тарифам и озвучка» (13.11.2026). «Ранее (до покупки X)» дашборд выразить не может — считала по датам заказов скриптом в списке заказов (`/pl/sales/deal/index?DealContext[rule_string]=…&page=N`, 30 строк на страницу).
Новый дашборд: форма `/pl/logic/funnel/create`. Цифры в табличных/новых блоках грузятся по кнопке «Загрузить данные». Длинные циклы JS (>45 с) запускать без await.
