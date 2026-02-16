---
created: 2026-02-16T21:31:53.968Z
title: Avatar picker compact layout with scroll
area: ui
files:
  - app/game/[gameId]/join/page.tsx
---

## Problem

Текущий экран выбора аватарок показывает все 26 аватарок сразу. На мобильных или маленьких экранах:
- Кнопка "Join Game" уезжает за пределы экрана
- Нужно скролить чтобы её увидеть
- Плохой UX для новых пользователей

## Solution

1. Ограничить сетку аватарок: показывать 6 (2x3) или 9 (3x3) за раз
2. Добавить scroll внутри контейнера аватарок (max-height + overflow-y: auto)
3. Кнопка "Join Game" всегда видна внизу (sticky или outside scroll container)
4. Возможно добавить индикатор "scroll for more"
