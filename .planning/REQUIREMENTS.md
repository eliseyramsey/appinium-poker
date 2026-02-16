# Requirements: Appinium Poker

**Defined:** 2026-02-16
**Core Value:** Команда может быстро и весело оценить задачи в Story Points

## v1 Requirements

### Admin Player Management

- [x] **ADMIN-01**: Admin может кикнуть игрока из игры (удалить из players)
- [x] **ADMIN-02**: Admin может назначить игрока спектатором (is_spectator = true)
- [x] **ADMIN-03**: Admin может передать админку другому игроку (сменить creator_id)

### Meme System

- [x] **MEME-01**: После reveal показывается мем на основе паттерна голосов
- [x] **MEME-02**: Категории: consensus (все одинаково), chaos (разброс >5), confused (?), break (☕), random
- [ ] **MEME-03**: ~50 русских мемов 2005-2020 распределены по категориям
- [x] **MEME-04**: Мем показывается в модалке поверх карт, закрывается кликом

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
| ADMIN-01 | Phase 1 | ✓ Complete |
| ADMIN-02 | Phase 1 | ✓ Complete |
| ADMIN-03 | Phase 1 | ✓ Complete |
| MEME-01 | Phase 2 | ✓ Complete |
| MEME-02 | Phase 2 | ✓ Complete |
| MEME-03 | Phase 2 | Pending (needs images) |
| MEME-04 | Phase 2 | ✓ Complete |
| DEPLOY-01 | Phase 3 | Pending |
| DEPLOY-02 | Phase 3 | Pending |
| DEPLOY-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-16*
