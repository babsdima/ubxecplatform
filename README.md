# GradeUp Platform

**GradeUp** — платформа для оценки и развития топ-менеджеров с executive search возможностями на её базе.

## Архитектура (краткая)

- **Next.js 16** (App Router) + **TypeScript**
- **Prisma 5** + **Neon Postgres** (eu-central)
- **NextAuth/Auth.js v5** (credentials)
- **Tailwind 4** + Steel design system
- **Recharts** + Framer Motion + @dnd-kit
- 5-блочный psychometric questionnaire + 6-component scoring engine

Полная документация архитектуры — [CLAUDE.md](./CLAUDE.md).

## Quick Start

### 1. Зависимости

```bash
npm install
```

### 2. Environment

Создай `.env.local`:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY=""
```

### 3. БД и seed

```bash
npx prisma db push          # применить schema
npm run db:seed             # сидировать 15 компетенций, 30 отраслей, 6 шаблонов + тестовые users
```

### 4. Dev server

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

### Тестовые аккаунты

Пароль: `password123`

- `cfo@example.ru` — кандидат
- `cto@example.ru` — кандидат
- `hr@pecapital.ru` — компания
- `hr@techscale.ru` — компания
- `admin@gradeup.ru` — админ

## Production build

```bash
npm run build               # prisma generate + next build
npm start
```

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build (включает `prisma generate`) |
| `npm run lint` | eslint |
| `npm run db:push` | синхронизация schema.prisma с БД (без миграции) |
| `npm run db:seed` | seed reference data + test users |
| `npm run db:studio` | Prisma Studio (визуальный DB browser) |

## Reset dev БД

```bash
npx prisma db push --force-reset --accept-data-loss && npm run db:seed
```

## Ключевые user flows

### Кандидат

1. Регистрация → `/candidate/onboarding` (legacy basic form)
2. `/candidate/assessment` — пройти 5 блоков опросника (~30–50 минут):
   - **Quick Profile**: E.2 (track record), E.3 (preferences), E.1 (competencies)
   - **Deep Profile**: A (personality), B (behavioral risks), C (motivation), D (culture/style)
3. После каждого блока auto-trigger scoring engine
4. `/candidate/results` — Development Snapshot (карта лидерства)
5. `/candidate/matches` — лента scored ролей с component breakdown + flags

### Компания

1. Регистрация → `/company/onboarding` (legacy)
2. `/company/profile` — 8-шаговый wizard (CP.1 identity → CP.8 confidentiality)
3. `/company/mandates/new` — создать мандат с template (CEO Growth, CFO PE-backed, etc.)
4. `/company/mandates/[id]/candidates` — список scored кандидатов
5. Express interest → mutual match → reveal contacts

## Документация

- [CLAUDE.md](./CLAUDE.md) — полная архитектура, для AI-агентов и разработчиков
- [AGENTS.md](./AGENTS.md) — Next.js 16 quirks reminder

## Backlog

Зафиксированы в [CLAUDE.md → Известные legacy / backlog](./CLAUDE.md). Главное:
- Удалить legacy `Assessment` model и связанный admin UI
- Полный R.1-R.7 wizard для редактирования мандата
- Validity checks integration в Match
- 152-ФЗ-compliant хостинг для production
- Mobile responsiveness audit
