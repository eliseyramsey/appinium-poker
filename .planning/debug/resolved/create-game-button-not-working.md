---
status: resolved
trigger: "create-game-button-not-working — На проде не работает кнопка Create Game. Ничего не происходит при клике."
created: 2026-02-18T00:00:00Z
updated: 2026-02-18T00:01:00Z
---

## Current Focus

hypothesis: ПОДТВЕРЖДЕНА. Две причины: (1) env vars не заданы в Vercel → API 503, (2) catch в create/page.tsx молча глотает ошибку — пользователь не видит что пошло не так
test: Прочитан код всех релевантных файлов, подтверждено в CLAUDE.md ("BLOCKER — Environment Variables not set")
expecting: Fix кода (добавить error state + UI) + инструкции по env vars для Vercel
next_action: Исправить silent catch в app/create/page.tsx, добавить error display

## Symptoms

expected: При клике на кнопку "Create Game" / "Start Game" должна происходить навигация или создание игры
actual: Ничего не происходит при клике на кнопку
errors: Неизвестно — нужно проверить код и логи
reproduction: Зайти на прод https://appinium-poker-rw1g.vercel.app/ и нажать кнопку создания игры
started: Неизвестно — возможно всегда

## Eliminated

- hypothesis: Проблема с навигацией кнопки "Start New Game" на лендинге
  evidence: Лендинг использует <Link href="/create"> — чистый HTML-якорь, навигация не может не работать без JS-ошибки
  timestamp: 2026-02-18T00:01:00Z

## Evidence

- timestamp: 2026-02-18T00:00:30Z
  checked: app/page.tsx
  found: Кнопка "Start New Game" — это <Link href="/create">, просто навигация
  implication: Лендинг кнопка работает правильно; проблема на странице /create

- timestamp: 2026-02-18T00:00:45Z
  checked: app/create/page.tsx строки 45-48
  found: catch(error) { setIsLoading(false) } — ошибка молча проглатывается, нет error state, нет UI
  implication: При любой ошибке API кнопка просто "возвращается" в исходное состояние, пользователь не видит ничего

- timestamp: 2026-02-18T00:00:50Z
  checked: app/api/games/route.ts строки 22-27
  found: isSupabaseConfigured() → 503 если env vars не заданы
  implication: На Vercel без env vars API всегда вернёт 503 → catch поймает → silent fail

- timestamp: 2026-02-18T00:00:55Z
  checked: CLAUDE.md Session Log (Session 6) + .env.local
  found: "BLOCKER — Environment Variables not set: App returns 503 because Supabase credentials missing in Vercel"
  implication: Подтверждает root cause #1; локально .env.local есть, на Vercel — нет

## Resolution

root_cause: |
  ДВОЙНАЯ ПРИЧИНА:
  1. Env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) не заданы в Vercel → API /api/games возвращает 503
  2. catch блок в app/create/page.tsx (строки 45-48) молча проглатывает ошибку — нет error state, нет UI → пользователь видит что "ничего не происходит"
  Первопричина #1 требует действий в Vercel Dashboard, первопричина #2 — code fix.
fix: |
  Добавлены в app/create/page.tsx:
  - const [error, setError] = useState<string | null>(null)
  - setError(null) в начале handleSubmit
  - catch(err) заменён на catch(err) с извлечением message и вызовом setError(message)
  - Красный error banner в JSX (показывается только при error !== null)
verification: |
  Код-ревью: error state инициализирован, сбрасывается при каждом submit, заполняется в catch с реальным сообщением из API, отображается в UI.
  Первопричина #1 (env vars в Vercel) требует ручного действия — задать переменные в Vercel Dashboard.
files_changed:
  - app/create/page.tsx
