# Appinium Poker

## What This Is

Real-time Planning Poker приложение для Scrum-команд. Анонимная игра без регистрации — достаточно поделиться ссылкой. Брендинг Appinium с командными мемами и фотографиями.

## Core Value

Команда может быстро и весело оценить задачи в Story Points, не тратя время на настройку и регистрацию.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Создание игры с настройками (название, шкала, auto-reveal) — Session 1
- ✓ Анонимный вход с именем и аватаром команды — Session 1
- ✓ Real-time синхронизация между игроками — Session 2
- ✓ Голосование картами Fibonacci (0-89, ?, ☕) — Session 2
- ✓ Auto-reveal когда все проголосовали — Session 2
- ✓ Countdown анимация перед reveal (3-2-1) — Session 2
- ✓ Issues sidebar (создание, редактирование, удаление) — Session 2
- ✓ Confidence Vote (Fist of Five) — Session 3
- ✓ Admin permissions (reveal, new round, управление issues) — Session 3
- ✓ Уникальные аватары команды с центрированием лица — Session 4
- ✓ Session persistence (auto-rejoin при возврате) — Session 5
- ✓ Player profile menu (смена имени/аватара) — Session 5

### Active

<!-- Current scope. Building toward these. -->

- [ ] Admin может кикнуть игрока из игры
- [ ] Admin может назначить игрока спектатором
- [ ] Admin может передать админку другому игроку
- [ ] Мемы показываются после reveal на основе паттерна голосов
- [ ] ~50 русских мемов 2005-2020 (Ждун, Гарольд, Дратути и т.п.)
- [ ] Deploy на Vercel (субдомен)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Регистрация и аккаунты — намеренно анонимно для простоты
- OAuth login — email/password не нужен, нет аккаунтов
- Мобильное приложение — web-first, адаптивный дизайн достаточен
- Real-time чат — не core для оценки, добавляет сложность
- Видео/аудио — интеграция со Slack/Zoom вместо встроенного
- История игр — каждая сессия независима

## Context

**Существующий стек:**
- Next.js 16 (App Router) + TypeScript
- Supabase (PostgreSQL + Realtime)
- Zustand для state management
- Tailwind CSS + Space Grotesk шрифт
- 26 фото команды в `public/avatars/`

**Текущее состояние:**
- 5 сессий разработки завершено
- Мультиплеер полностью работает
- GitHub: https://github.com/eliseyramsey/appinium-poker
- PR #1 с аватарами команды

## Constraints

- **Hosting**: Vercel free tier — ограничения на serverless functions
- **Database**: Supabase free tier — 500MB storage, 2GB bandwidth
- **Budget**: $0 — только бесплатные сервисы
- **Мемы**: Только публичные изображения, без копирайта

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Anonymous play | Убрать барьер входа — ссылка = вход | ✓ Good |
| Supabase Realtime | Бесплатно, встроенная синхронизация | ✓ Good |
| Team photos as avatars | Узнаваемость коллег, веселее | ✓ Good |
| Russian memes 2005-2020 | Ностальгия, культурный контекст команды | — Pending |
| Context menu for admin | Интуитивный UX для управления игроками | — Pending |

---
*Last updated: 2026-02-16 after project initialization*
