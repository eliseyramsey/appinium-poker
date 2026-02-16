---
created: 2026-02-16T21:31:53.968Z
title: Meme slide-in animation instead of fullscreen overlay
area: ui
files:
  - components/memes/MemeOverlay.tsx
---

## Problem

Текущая реализация мема после reveal перекрывает весь экран модалкой. Это мешает игре и требует клика для закрытия.

Пользователь хочет:
- Мем выплывает справа из края экрана
- Показывается пару секунд
- Уходит обратно сам
- Не мешает продолжать игру

## Solution

1. Заменить модалку на toast-подобную анимацию
2. Позиционирование: fixed bottom-right или right-center
3. CSS animation: slideInFromRight → pause → slideOutToRight
4. Убрать backdrop/overlay
5. Автоматическое скрытие через 3-5 секунд
6. Можно кликнуть чтобы закрыть раньше
