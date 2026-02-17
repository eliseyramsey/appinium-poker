# Phase 3: Deploy to Vercel

## Prerequisites

- GitHub repo: https://github.com/eliseyramsey/appinium-poker
- Supabase project with credentials in `.env.local`

## Option 1: Vercel Dashboard (Recommended)

1. Зайди на https://vercel.com/new
2. Import из GitHub → выбери `appinium-poker`
3. Framework: Next.js (автоопределится)
4. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<твой URL из Supabase>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<твой ключ из Supabase>
   NEXT_PUBLIC_APP_URL=https://appinium-poker.vercel.app
   ```
5. Deploy

## Option 2: Vercel CLI

```bash
# 1. Авторизация (откроется браузер)
npx vercel login

# 2. Линк проекта (первый раз)
npx vercel link

# 3. Добавь env vars через dashboard или CLI
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add NEXT_PUBLIC_APP_URL

# 4. Деплой в production
npx vercel --prod
```

## After Deploy

1. Открой URL (xxx.vercel.app)
2. Создай игру → пригласи друга по ссылке
3. Проверь мультиплеер в двух вкладках

## Troubleshooting

**"Database not configured"**
→ Проверь Environment Variables в Vercel Dashboard

**Realtime не работает**
→ В Supabase → Realtime → включи таблицы: games, players, votes, issues, confidence_votes

**CORS ошибки**
→ Добавь Vercel URL в Supabase → Settings → API → Allowed URLs
