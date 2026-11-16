---
name: project-tsss-mailing-check
description: "Агент проверки рассылок tsss.site (GC) — ТЗ формат, паттерны сегментов, найденные ловушки"
metadata:
  node_type: memory
  type: project
  originSessionId: 5bd2237f-ab48-42ac-b11c-ae43a87e8f3d
  modified: 2026-10-24T08:30:00.872Z
---

24.10.2026 пользователь попросил агента, который проверяет рассылки и сегменты на GC **tsss.site** (не F5GAME) по ТЗ. Дала 7 примеров (ТЗ + ссылки на 4 рассылки EMAIL/TG/MAX/VK, текст в Google Docs).

Паттерны tsss:
- Название: `[EMAIL|TG|MAX|VK] ПРОДУКТ | событие [дд.мм.гг] в ЧЧ`; отправитель Tim Shtok Sound Studio; бот TSSS_Notification_bot.
- Сегмент бота = сегмент email + `user_telegram_connected` / `user_max_connected` / `user_vk_connected`. Тип «ученик» всегда.
- «Купил озвучку или подкаст» = НЕ заказ (теги Событие|Покупка/Повышение тарифа) × (product-ОЗВУЧКА 2.0, product-Озвучка, product-Подкасты, Продукт|Озвучка), статус Завершён/Частично оплачен.
- «Зареган или был онлайн» = заказ на предложение «Регистрация на вебинар» ИЛИ группа регистрации ИЛИ «Вход на вебинар» ИЛИ посетил вебинар.
- UTM: source=gk, medium=email/tgbot/vk/max, campaign=ддммгг, group=crm.
- У отправленных TG/MAX рассылок кнопки в превью не видны.

Скрипт сбора: scratchpad extract.js → перенести в скилл. Связано с [[project-gc-mailing-agent]].
