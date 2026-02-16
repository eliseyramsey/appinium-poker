# Requirements: Appinium Poker

**Defined:** 2026-02-16
**Core Value:** Команда может быстро и весело оценить задачи в Story Points

## v1 Requirements

### Admin Player Management

- [ ] **ADMIN-01**: Admin может кикнуть игрока из игры (удалить из players)
- [ ] **ADMIN-02**: Admin может назначить игрока спектатором (is_spectator = true)
- [ ] **ADMIN-03**: Admin может передать админку другому игроку (сменить creator_id)

### Meme System

- [ ] **MEME-01**: После reveal показывается мем на основе паттерна голосов
- [ ] **MEME-02**: Категории: consensus (все одинаково), chaos (разброс >5), confused (?), break (☕), random
- [ ] **MEME-03**: ~50 русских мемов 2005-2020 распределены по категориям
- [ ] **MEME-04**: Мем показывается в модалке поверх карт, закрывается кликом

### Deploy

- [ ] **DEPLOY-01**: Приложение задеплоено на Vercel
- [ ] **DEPLOY-02**: Environment variables настроены (Supabase URL/Key)
- [ ] **DEPLOY-03**: Приложение доступно по публичной ссылке

## v2 Requirements

(None — это финальный релиз)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Регистрация | Намеренно анонимно |
| История игр | Каждая сессия независима |
| Мобильное приложение | Web адаптивен |
| Real-time чат | Вне core функционала |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ADMIN-01 | Phase 1 | Pending |
| ADMIN-02 | Phase 1 | Pending |
| ADMIN-03 | Phase 1 | Pending |
| MEME-01 | Phase 2 | Pending |
| MEME-02 | Phase 2 | Pending |
| MEME-03 | Phase 2 | Pending |
| MEME-04 | Phase 2 | Pending |
| DEPLOY-01 | Phase 3 | Pending |
| DEPLOY-02 | Phase 3 | Pending |
| DEPLOY-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-16*
