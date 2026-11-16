---
name: project-freeweb3-utm-loss
description: "Потеря UTM в заказах «Регистрация ОВ3» (оффер 8806934, iscelenie-course.ru) — причина, ручное восстановление, фикс export/freeweb3-utm-forward.html"
metadata:
  node_type: memory
  type: project
  originSessionId: 722a28f8-788a-4e7f-81b2-77f8fc2857f9
  modified: 2026-10-28T15:39:04.405Z
---

28.10.2026: у ~5% заказов оффера 8806934 пустые доп. поля utm_* (1466362–1466366). Лендинг life-practic.ru/course/recurring-patterns/freeweb3/ (WordPress/Elementor) передаёт UTM на /reg/ inline-скриптом redirectParams на DOMContentLoaded; ниже кнопок 12 синхронных скриптов (в т.ч. cdn.jsdelivr.net), клик до их загрузки → /reg/ без меток → виджет GC (pl/lite/widget) не получает UTM.

Восстановлено 194 заказа: UTM брались из сессии GC (поле «Страница с которой пришел пользователь»), запись через форму заказа (скрытый iframe + кнопка «Сохранить»). 93 заказа без меток в сессии — пусто честно.

Фикс подготовлен в export/freeweb3-utm-forward.html (клик-перехват + localStorage-восстановление на /reg/), на сайт не ставился — нужен доступ к WP.

**Why:** если клиент снова пришлёт выборку пустых UTM — знать причину и способ восстановления.
**How to apply:** сначала проверить, стоит ли фикс на лендинге; восстанавливать UTM тем же способом. Связано с [[project-ov3-rejection-test]].
