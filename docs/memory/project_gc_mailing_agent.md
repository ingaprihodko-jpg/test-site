---
name: project-gc-mailing-agent
description: Скилл-агент gc-mailing переносит письма из Google Docs в черновики рассылок GetCourse (e-mail/TG/VK/MAX)
metadata:
  type: project
---

Агент рассылок сделан 2026-10-13 по мотивам статей getcourse.ru/magazine/ai-rassylky-na-gc и ai-agent-rassylok-gc. Лежит в `.claude/skills/gc-mailing/` (SKILL.md, config.md с данными аккаунта, doc-template.md).

Решения пользователя: источник — Google Docs; каналы — e-mail, Telegram, ВКонтакте, MAX; вёрстка e-mail — по образцу рассылки в GC; UTM-метки пользователь ставит сам в документе, агент их не добавляет.

**Why:** следующий шаг после рассылок — такой же скилл для сайтов (правила GetCourse из [[feedback_getcourse_block_css]], [[feedback_chrome_paste_cyrillic_bug]] и др.).
**How to apply:** новые особенности интерфейса GC дописывать в config.md/SKILL.md скилла, а не в память.
