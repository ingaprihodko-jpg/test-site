---
name: feedback-optimize-api-cost
description: "Always propose the cheapest viable option and actively look for ways to cut API/process cost, without being asked each time"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c7b5e0f0-7771-4183-a0c4-1f90342f96ad
  modified: 2026-07-31T06:55:23.829Z
---

Default to proposing the low-cost option, and proactively think about how to optimize cost and process — not just when asked.

**Why:** In the content-agents project (Telegram magazine-cover bot), testing and bulk jobs against the Anthropic API burned through a $20 top-up in a few days — partly from repeated dry-run testing (dry-run still calls the paid API for classification/interpretation, only the Telegram send is skipped), partly from an expensive model+web-search combo being used even for simple yes/no classification tasks, and partly from a bulk archive job (26 items) accidentally running multiple overlapping times due to a hung/killed background process. The user was surprised and had to top up again.

**How to apply:** When designing or reviewing any workflow that calls a paid API (especially per-item loops, vision, or web search):
- Use the cheapest model that can do the job (e.g. Haiku for simple classification, reserve Sonnet/Opus + web search for tasks that actually need it).
- Downscale/compress images before sending to a model for analysis when full resolution isn't needed for the judgment being made (keep full quality only for the final user-facing deliverable, e.g. what's sent to Telegram).
- Trim tool-call budgets (e.g. web_search `max_uses`) to the minimum that still gets good results.
- Flag when a bulk/one-off job (e.g. building a historical archive) is a good candidate for the Batch API (50% cheaper, async) instead of live calls.
- Warn the user when a test loop or debugging run will itself cost real money (e.g. `--dry-run` in this project still makes paid API calls), so they aren't surprised by burn rate.
- Avoid accidentally re-running the same expensive job twice (e.g. a killed background process whose replacement duplicates work already paid for).

Surface these cost angles by default in proposals — don't wait for the user to ask "how do we make this cheaper."
