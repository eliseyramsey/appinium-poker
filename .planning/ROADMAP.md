# Roadmap: Appinium Poker

**Created:** 2026-02-16
**Phases:** 5
**Core Value:** Команда может быстро и весело оценить задачи в Story Points

## Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Admin Player Management | Admin может управлять игроками | ADMIN-01, ADMIN-02, ADMIN-03 | Complete |
| 2 | Meme System | Мемы показываются после reveal | MEME-01, MEME-02, MEME-03, MEME-04 | Complete |
| 3 | Deploy | Приложение доступно публично | DEPLOY-01, DEPLOY-02, DEPLOY-03 | Complete |
| 4 | Bug Fixes | Исправить security и quality баги | BUGS-01 to BUGS-14 | Complete |
| 5 | Quick Wins + Tests | UX polish и test coverage | QW-01 to QW-05, TEST-01 to TEST-03 | Complete |

---

## Phase 1: Admin Player Management

**Goal:** Admin может кикнуть игрока, назначить спектатором, передать админку

**Requirements:**
- ADMIN-01: Кикнуть игрока
- ADMIN-02: Назначить спектатором
- ADMIN-03: Передать админку

**Success Criteria:**
1. Правый клик на игрока показывает контекстное меню (только для админа)
2. "Kick" удаляет игрока из игры, он видит сообщение "Вас удалили"
3. "Make Spectator" меняет is_spectator, игрок больше не может голосовать
4. "Transfer Admin" меняет creator_id, у нового админа появляется crown

**Dependencies:** None (существующая админ-система)

---

## Phase 2: Meme System

**Goal:** После reveal показывается мем на основе паттерна голосов

**Requirements:**
- MEME-01: Показ мема после reveal
- MEME-02: Категории по паттернам
- MEME-03: ~50 русских мемов
- MEME-04: Модалка с мемом

**Success Criteria:**
1. После reveal появляется модалка с мемом
2. consensus (все одинаково) -> мем про согласие
3. chaos (разброс >5 points) -> мем про хаос
4. confused (кто-то ?) -> мем про непонимание
5. break (кто-то coffee) -> мем про перерыв
6. Клик по модалке закрывает её

**Dependencies:** Phase 1 не блокирует (параллельно можно)

---

## Phase 3: Deploy

**Goal:** Приложение доступно по публичной ссылке на Vercel

**Requirements:**
- DEPLOY-01: Deploy на Vercel
- DEPLOY-02: Environment variables
- DEPLOY-03: Публичная ссылка

**Success Criteria:**
1. `vercel deploy --prod` успешен
2. Supabase credentials в Vercel Environment Variables
3. Приложение открывается по ссылке xxx.vercel.app
4. Создание игры и мультиплеер работают

**Dependencies:** Phase 1, Phase 2 (deploy финального кода)

---

## Phase 4: Bug Fixes

**Goal:** Исправить все security и quality баги из code review

**Requirements:**

*Critical (Security):*
- BUGS-01: Fix race condition in vote upsert (TOCTOU vulnerability)
- BUGS-02: Add admin auth to DELETE /api/votes
- BUGS-03: Add admin auth to POST /api/issues
- BUGS-04: Add game ownership check to issues CRUD

*Warning (Quality):*
- BUGS-05: Remove unsafe supabase export
- BUGS-06: Add error feedback to user actions
- BUGS-07: Validate vote values in API
- BUGS-08: Remove duplicate getMemeCategory
- BUGS-09: Refactor confidence DELETE to use query params
- BUGS-10: Split game room page into components

*Suggestion (Tech Debt):*
- BUGS-11: Generate Supabase types to remove `as never`
- BUGS-12: Centralize hardcoded strings
- BUGS-13: Document useEffect deps limitation
- BUGS-14: Fix join page error state bug

**Plans:** 4 plans

Plans:
- [x] 4-01-PLAN.md — Critical API Security (BUGS-01, 02, 03, 04, 07) ✓
- [x] 4-02-PLAN.md — Code Quality Cleanup (BUGS-05, 08, 09, 12, 13) ✓
- [x] 4-03-PLAN.md — Component Refactoring (BUGS-10) ✓
- [x] 4-04-PLAN.md — Error Feedback + Types (BUGS-06, 14, 11) ✓

**Success Criteria:**
1. All 4 critical security issues fixed
2. API endpoints validate admin permissions
3. No cross-game data manipulation possible
4. Error messages shown to users on failures
5. Game room page refactored into smaller components

**Dependencies:** Phase 3 (fix on deployed codebase)

---

## Phase 5: Quick Wins + Tests

**Goal:** UX polish из Product Review + базовое покрытие тестами

**Requirements:**

*Quick Wins (UX):*
- QW-01: Game Not Found page (404 для несуществующих игр)
- QW-02: Loading states на async операциях
- QW-03: Keyboard shortcuts (Enter=reveal, 1-9=vote, Escape=deselect)
- QW-04: Error boundaries (graceful fallback при ошибках)
- QW-05: Empty state improvement для Issues sidebar

*Testing:*
- TEST-01: Setup Vitest и testing-library
- TEST-02: Unit tests для utils (calculateAverage, generateGameId, getMemeCategory)
- TEST-03: Component tests (Button, Input, CardSelector)

**Success Criteria:**
1. При переходе по несуществующей ссылке — friendly "Game not found" страница
2. Все кнопки показывают spinner во время loading
3. Keyboard shortcuts работают в game room
4. Ошибка в компоненте не крашит всю страницу
5. `npm run test` запускает Vitest и все тесты проходят
6. Coverage: utils 100%, components 80%+

**Depends on:** Phase 4

**Plans:** 4 plans

Plans:
- [x] 05-01-PLAN.md — Game Not Found + Empty State (QW-01, QW-05) ✓
- [x] 05-02-PLAN.md — Loading States + Keyboard + Error Boundary (QW-02, QW-03, QW-04) ✓
- [x] 05-03-PLAN.md — Vitest Setup (TEST-01) ✓
- [x] 05-04-PLAN.md — Unit + Component Tests (TEST-02, TEST-03) ✓

---

*Roadmap created: 2026-02-16*
*Updated: 2026-02-17 — Phase 5 planned*
