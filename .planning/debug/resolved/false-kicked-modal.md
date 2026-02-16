---
status: resolved
trigger: "При выходе из игры и возврате показывается модалка 'Вас удалили из игры', хотя никто не кикал"
created: 2026-02-17T12:00:00Z
updated: 2026-02-17T12:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - useEffect для "kicked" detection не отслеживает ПРЕДЫДУЩЕЕ состояние players. Он просто проверяет "игрок сейчас в списке?", а должен проверять "был в списке И теперь нет"
test: Проанализировал все сценарии - проблема в том что при редиректе с join page currentPlayer устанавливается ДО загрузки players в game room
expecting: Нужно отслеживать предыдущее состояние players через useRef
next_action: Исправить логику - добавить prevPlayersRef и проверять что игрок БЫЛ в предыдущем списке

## Symptoms

expected: При возврате в игру игрок должен нормально зайти обратно
actual: Показывается модалка "Вас удалили из игры", хотя кика не было
errors: Нет явных ошибок, неправильное срабатывание UI
reproduction: 1) Зайти в игру, 2) Закрыть/перезагрузить, 3) Вернуться, 4) Увидеть "kicked"
started: После реализации функции кика игроков

## Eliminated

## Evidence

- timestamp: 2026-02-17T12:05:00Z
  checked: app/game/[gameId]/page.tsx строки 337-345
  found: |
    useEffect проверяет stillInGame = players.some(p => p.id === currentPlayer.id)
    Если !stillInGame -> setWasKicked(true)
    Проблема: players грузятся асинхронно. При первом рендере players = [],
    а currentPlayer уже восстановлен из localStorage.
    Условие !stillInGame срабатывает ДО загрузки players из Supabase.
  implication: Race condition между восстановлением сессии и загрузкой players

## Resolution

root_cause: |
  useEffect на строках 337-345 проверяет "игрок сейчас в списке players?" без отслеживания предыдущего состояния.
  При переходе с join page: currentPlayer устанавливается через Zustand, потом game room грузит players.
  Если players загружается ДО того как игрок попадает в список (race condition) или по какой-то причине
  игрок не найден - модалка показывается неправильно.

  Правильная логика: показывать модалку только когда игрок БЫЛ в предыдущем списке players И ТЕПЕРЬ его нет.
  Это гарантирует что модалка показывается только при реальном DELETE событии (кик).

fix: |
  Добавил prevPlayersRef = useRef для отслеживания предыдущего состояния players.
  Изменил логику useEffect:
  1. Сохраняем текущие players в ref
  2. Пропускаем если нет предыдущего состояния (первая загрузка)
  3. Проверяем wasInGame = prevPlayers.some(p => p.id === currentPlayer.id)
  4. Проверяем stillInGame = players.some(p => p.id === currentPlayer.id)
  5. setWasKicked(true) ТОЛЬКО если wasInGame && !stillInGame
verification: |
  1. Build успешно прошел (npm run build)
  2. Логический анализ сценариев:
     - Перезагрузка страницы: prevPlayers=null -> return -> OK
     - Реальный кик: wasInGame=true, stillInGame=false -> модалка -> OK
     - Редирект с join: prevPlayers=null -> return -> OK
     - Новый игрок: stillInGame=true -> нет модалки -> OK
files_changed:
  - app/game/[gameId]/page.tsx
