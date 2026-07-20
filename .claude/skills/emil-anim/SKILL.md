---
name: emil-anim
description: Use when adding, reviewing, or auditing UI animations and transitions (hover states, page/content entrances, modals, list items, element removal). Applies Emil Kowalski's motion-design principles for web interfaces — duration, easing choice, which CSS properties to animate, and when not to animate at all.
license: N/A
---

Apply these rules whenever writing or reviewing CSS/JS animation code for UI elements.

## Duration

- Keep any single animation under 1 second. Most UI transitions should land in the 100–300ms range; reserve durations closer to 1s for larger, more deliberate movements.

## Easing

- **Entrances** (an element appearing): `ease-out`. Starts fast, settles gently — feels responsive.
- **Exits** (an element disappearing): `ease-in`. Starts slow, accelerates away — feels quick to leave.
- **Movement on screen** (repositioning, dragging, reordering): `ease-in-out` only.
- **Never use `linear`** for UI animation — it reads as mechanical and unnatural. The only exception is continuous/looping effects (e.g. spinners) with no distinct start or end.

## Properties

- Animate `transform` and `opacity` only whenever possible. These run on the compositor and stay smooth; animating `width`, `height`, `top`, `left`, `margin`, etc. forces layout/paint and causes jank.
- If a layout property must change, prefer a `transform` equivalent (e.g. `translateX` instead of `left`) or accept a discrete (non-animated) change.

## What not to animate

- Don't animate elements that get interacted with frequently or repetitively — e.g. every button in a long list, items in a fast-scrolling feed, or anything triggered many times per session. The repetition turns a nice touch into friction; skip the animation or keep it near-instant (≤100ms, opacity only).

## Default content entrance pattern

- For content appearing (cards, list items, sections fading in), default to: `opacity 0 → 1` combined with a `translateY(8px) → translateY(0)` shift. Keep it subtle — 8px, not more — paired with `ease-out` and a short duration (150–250ms).
