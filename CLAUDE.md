@AGENTS.md

# GradeUp Platform — Architecture Reference

## Бренд

- **GradeUp** — публичное название продукта (везде в UI и копирайтах)
- **UbXec** — внутреннее кодовое имя / имя репо-папки `ubxec-platform/` / vault. В UI **не используется**.
- Слоган: «GradeUp — Развитие. Доход. Возможности.»

## Tech Stack

| Слой | Технология |
|---|---|
| Framework | Next.js 16 + React 19 (App Router) |
| Язык | TypeScript (strict) |
| Стили | Tailwind 4 + custom CSS variables (Steel design system) |
| ORM | Prisma 5 |
| БД | Postgres (Neon, eu-central) |
| Auth | NextAuth/Auth.js v5 (credentials) |
| Email | Resend |
| Charts | Recharts + custom SVG |
| Animations | Framer Motion |
| Drag-and-drop | @dnd-kit (используется только для рангинга) |
| UI primitives | shadcn/ui (Radix-based) + custom |

## Дизайн-система Steel

- **Шрифты:** Inter (sans-serif default), Playfair Display (display headings)
- **Палитра:** HSL-based (см. `src/app/globals.css`)
  - `--ink-900..200` — primary dark navy
  - `--neutral-50..900` — warm grey scale
  - `--warm-white` — text on dark
  - `--success`, `--warning`, `--danger` — semantic
  - Accent: emerald (#16a34a / #2D7A5F)
- **Utility classes:**
  - `.dash-bg` — full background
  - `.dash-hero` — dark gradient header
  - `.pc` — white card; `.pc-green` — completed/success state
  - `.ui-input`, `.ui-textarea` — form inputs
- **Шрифты в скоркард-мокапе** (Outfit + JetBrains Mono) **не используются** — стилизуем под Steel.

## Структура

```
src/
├── app/
│   ├── (root)/                   — landing
│   ├── auth/                     — login, register
│   ├── candidate/
│   │   ├── dashboard/            — обзор + quick actions
│   │   ├── profile/              — legacy profile form
│   │   ├── assessment/           — главный hub two-session
│   │   │   ├── block-a/...e3/    — блоки опросника
│   │   ├── results/              — Development Snapshot
│   │   ├── matches/              — лента ролей со scoring
│   │   ├── services/, onboarding/
│   ├── company/
│   │   ├── dashboard/
│   │   ├── profile/              — 8-шаговый CP wizard
│   │   ├── mandates/
│   │   │   ├── new/              — template-based creator
│   │   │   ├── [id]/             — legacy detail
│   │   │   └── [id]/candidates/  — scored candidates list
│   │   └── onboarding/
│   ├── admin/                    — verification UI
│   └── api/auth/                 — NextAuth handler
├── components/
│   ├── ui/                       — shadcn primitives
│   ├── layout/                   — candidate-nav, company-nav, admin-nav
│   ├── charts/                   — RadarChart, StenBar, ScoreBar, OcaiQuadrant, OcaiEditor, StyleScale, OverallScoreRing
│   ├── questionnaire/            — Shell, ForcedChoiceCard, LikertScale, ScenarioPair, SemanticDifferential, RankingCards, ForcedDistribution, TrackRecordForm, PreferencesForm
│   └── employer/                 — CompanyProfileWizard, MandateCreator
├── lib/
│   ├── auth.ts                   — NextAuth config
│   ├── db.ts                     — Prisma client
│   ├── actions.ts                — legacy server actions
│   ├── format.ts                 — RU formatting helpers
│   ├── matching.ts               — legacy matching engine
│   ├── email.ts                  — Resend wrappers
│   ├── questionnaire/
│   │   ├── types.ts              — Question types union
│   │   ├── actions.ts            — saveQuestionResponse, completeBlock, getAllBlockProgress
│   │   ├── actions-e23.ts        — saveTrackRecord, savePreferences
│   │   ├── blocks/               — blockA, blockB, blockC, blockD, blockE1 + scales + index
│   │   └── scoring/              — raw-scores, normalize, block-cd
│   ├── scoring/
│   │   ├── hard-filters.ts       — gate перед matching
│   │   ├── component-scores.ts   — 6 fit функций
│   │   ├── overall-match.ts      — weighted sum + getMatchLabel
│   │   ├── validity-checks.ts    — consistency analysis (готов, но не интегрирован в pipeline)
│   │   ├── insights.ts           — auto-generated strengths/growth для Development Snapshot
│   │   ├── run-scoring.ts        — orchestrator
│   │   └── actions.ts            — server actions для триггера
│   └── employer/
│       └── actions.ts            — saveCompanyProfileSection, createMandateFromTemplate, saveMandateSection, activateMandate
└── types/
```

## Архитектура опросника

5 блоков, ~145 items, 38–50 минут:

- **Блок A** Personality (10 шкал, ~30 items) — forced-choice + Likert
- **Блок B** Behavioral Risks (6 шкал, ~30 items) — нейтральные форм. для 152-ФЗ
- **Блок C** Motivational Drivers (8 шкал, ~32 items) — forced-ranking триады + Likert
- **Блок D** Culture & Style (4+4 шкалы, ~24 items) — scenario_pair, scenario_quad, semantic_differential
- **Блок E.1** Competencies — forced-distribution 15 компетенций в 3 группы по 5
- **Блок E.2** Track Record — структурированная форма (level, P&L, контексты)
- **Блок E.3** Preferences — целевые роли, география, компенсация, dealbreakers

Все ответы сохраняются в `QuestionnaireResponse.responses` (JSONB). После завершения блока запускается scoring и обновляется `ScaleScore`.

## Архитектура scoring engine

6-stage pipeline (см. `src/lib/scoring/run-scoring.ts`):

1. **Load** — CandidateProfile + ScaleScore + CandidatePreferences + Mandate + CompanyProfile
2. **Hard filters** — отсечка (опыт, P&L, отрасль, контексты, релокация, компенсация)
3. **Component scores** — 6 функций, каждая → 0-100:
   - `competencyFit` (top5 ∩ must-have)
   - `trackRecordFit` (level + P&L + team + industries + contexts)
   - `personalityFit` (range fit по A-stens vs personality prefs)
   - `riskScore` (threshold check B-stens vs risk tolerance) + flags
   - `motivationalFit` (top3 ranking match)
   - `culturalScores` (cosine similarity for fit + add + style)
4. **Overall match** — weighted sum, default `{competency: 25%, trackRecord: 20%, personality: 15%, risk: 10%, motivational: 15%, cultural: 15%}`
5. **Match label** — strong/good/conditional/weak/mismatch
6. **Persist** — upsert Match с component breakdown + flags

Триггеры пересчёта:
- При завершении блока опросника
- При сохранении E.2 / E.3
- При активации мандата
- Через ручную кнопку "Пересчитать" в UI

## Тестовые аккаунты (после `npm run db:seed`)

Пароль для всех: `password123`

| Email | Роль |
|---|---|
| `admin@gradeup.ru` | ADMIN |
| `cfo@example.ru` | CANDIDATE (CFO, Финтех, 14 лет) |
| `cto@example.ru` | CANDIDATE (CTO, IT, 12 лет) |
| `hr@pecapital.ru` | EMPLOYER (PE Capital → мандат CFO) |
| `hr@techscale.ru` | EMPLOYER (TechScale → мандат CTO) |

## Reference data (seeded)

- **15 Competency** (E.1)
- **30 Industry** (российский контекст)
- **6 RoleTemplate** (CEO Growth/Turnaround, CFO PE-backed, CTO Product Tech, COO Scaling, CHRO Transformation)

## Команды разработки

```bash
npm run dev         # dev server (порт 3000)
npm run build       # prisma generate + next build (production check)
npm run lint        # eslint
npm run db:push     # применить schema.prisma в БД (без миграции)
npm run db:seed     # запустить prisma/seed.ts
npm run db:studio   # Prisma Studio
```

Polnyi reset:
```bash
npx prisma db push --force-reset --accept-data-loss && npm run db:seed
```

## Environment Variables

`.env.local`:
```
DATABASE_URL="postgresql://..."   # Neon Postgres connection string
NEXTAUTH_SECRET="..."              # 32+ char random string
NEXTAUTH_URL="http://localhost:3000"  # production: https://your-domain
RESEND_API_KEY=""                  # Resend (опц., для emails)
```

## 152-ФЗ compliance notes

- Behavioral Risks (Блок B) сформулированы как «поведенческие предпочтения», без клинической лексики (соответствует трактовке как health-related data в худшем случае)
- Все scoring результаты — augmentation, не automated decisions (нет автоматических hire/no-hire выводов)
- Hard filters работают как фильтр, но финальное решение всегда за человеком
- Для production: миграция на российский Postgres-хостинг (Selectel/Yandex Cloud/VK Cloud) перед launch с реальными executives

## Известные legacy / backlog

- **`Assessment` model** — оставлена для compat существующего admin UI; удалить в будущем cleanup'е после полного перехода на questionnaire engine
- **Legacy fields на `CandidateProfile`** (`achievements`, `salaryMin/Max`, `locationPref` etc.) — деривируем из новых E.2 полей в Phase 8
- **`/company/profile/profile-form.tsx`** — orphan после Phase 6, удалить вместе с `Assessment`
- **`src/lib/matching.ts`** — legacy matching engine (по keyword), не вызывается из новых страниц
- **Validity checks** в `scoring/validity-checks.ts` — реализованы, но не интегрированы в Match record (Phase 8)
- **R.1-R.7 full edit wizard** для мандатов — сейчас MandateCreator делает только базовое заполнение + template defaults
- **`/company/onboarding`** — старый flow для compat; новый wizard в `/company/profile`
- **Mobile responsiveness** — в основном работает (Tailwind), но детальный audit не проведён

## Как развернуть на Vercel

1. **Push код в GitHub**
2. **Vercel → New Project → Import** репозиторий
3. **Environment Variables** в Vercel dashboard:
   - `DATABASE_URL` — Neon production string (не dev!)
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://your-domain.vercel.app`
   - `RESEND_API_KEY` (опц.)
4. **Build command:** `npm run build` (уже использует `prisma generate`)
5. **Output directory:** `.next` (default)
6. **Database migration:** `npx prisma db push` локально с production `DATABASE_URL`, или настроить миграции через GitHub Actions
7. **Seed reference data** в production: запустить `prisma/seed.ts` против production БД (только справочники Competency/Industry/RoleTemplate; тестовые users можно skip)

⚠️ **Важно для production:** перед запуском с реальными executives — провести аудит на соответствие 152-ФЗ и переехать на российский cloud провайдер.
