# Policy Panic — FreeIPA Booth Game

A fast, mobile-friendly identity-security quiz game for the FreeIPA booth at tech conferences. Students scan a QR code, answer 10 rapid-fire scenarios about identity management, and learn what FreeIPA does — all in under a minute.

## Quick Start (local dev)

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
```

## Routes

| Route      | Purpose                                                        |
| ---------- | -------------------------------------------------------------- |
| `/`        | Landing page — enter name + email, see shared leaderboard      |
| `/play`    | Gameplay — 10 timed questions, 3 answer choices each           |
| `/results` | Score, accuracy, streak stats, links to FreeIPA resources      |
| `/booth`   | Full-screen QR code for your booth screen (attendees scan it)  |
| `/admin`   | PIN-protected admin page — see all names + emails, export CSV  |

## Architecture

```
Phone (React SPA)           Vercel Serverless           Supabase
─────────────────           ─────────────────           ────────
GET /api/leaderboard   →    api/leaderboard.ts     →    scores table
POST /api/submit-score →    api/submit-score.ts    →    scores table
POST /api/admin/list   →    api/admin/list.ts      →    scores table
GET /api/generate-questions → api/generate-questions.ts → OpenAI API
```

- **Shared leaderboard**: all players see the same top scores (stored in Supabase)
- **Emails are private**: only visible via `/admin` after entering the admin PIN
- **AI questions**: generated server-side so the OpenAI key is never exposed to browsers
- **Fallback**: if AI generation fails, 10 random questions from the static 50-question bank are used

## Deploy to Vercel + Supabase

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a project. In the SQL editor, run:

```sql
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create index if not exists scores_score_idx on public.scores (score desc);
create index if not exists scores_created_at_idx on public.scores (created_at desc);

alter table public.scores enable row level security;
```

### 2. Set environment variables on Vercel

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable                    | Where to find it                                      |
| --------------------------- | ----------------------------------------------------- |
| `SUPABASE_URL`              | Supabase → Settings → API → Project URL               |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (keep secret) |
| `ADMIN_PIN`                 | Choose a strong PIN for the /admin page               |
| `OPENAI_API_KEY`            | (optional) platform.openai.com/api-keys               |

### 3. Deploy

```bash
# Push to GitHub, then connect the repo to Vercel, or:
npx vercel --prod
```

Build command: `npm run build`
Output directory: `dist`

Vercel automatically picks up `vercel.json` for routing and the `api/` folder for serverless functions.

## Scoring

- **100 base points** per correct answer
- **Time bonus**: remaining seconds x 15
- **Streak bonus**: consecutive correct x 25 extra
- **Maximum possible score**: 3,575 (perfect 10/10 with instant answers)
- Personal best is also stored locally on each phone via localStorage

## Question Bank

53 static questions covering: SSO, Kerberos, Groups & RBAC, Account Lifecycle, Password Policy, Certificates, Host Identity, Sudo Rules, DNS, OTP/2FA, Trust & Federation, Audit & Logging, and Open Source.

10 are randomly picked per game (or AI-generated if OpenAI key is configured).

Edit `src/game/questionBank.ts` to add, remove, or tweak static questions.

## Admin: Viewing Emails

1. Go to `/admin` on the deployed site
2. Enter the admin PIN (set via `ADMIN_PIN` env var on Vercel)
3. See the full table: name, email, score, date
4. Click **Export CSV** to download a spreadsheet

## Customizing

- **Questions**: `src/game/questionBank.ts`
- **Timer / count**: constants at the top of `src/pages/Game.tsx`
- **Scoring formula**: `src/game/scoring.ts`
- **QR target URL**: visit `/booth?url=https://your-domain.com/` to override
- **Max leaderboard size**: change the `.limit()` in `api/leaderboard.ts`

## Tech Stack

- Vite + React + TypeScript (frontend)
- Vercel Serverless Functions (API routes)
- Supabase / PostgreSQL (shared leaderboard)
- OpenAI gpt-4o-mini (optional AI question generation)
- qrcode.react (QR code for booth display)
- Vanilla CSS (no UI framework — small bundle, fast load)

## Offline Support

The app registers a service worker on first load. Gameplay works offline using the static question bank. Scores are saved locally and will attempt to sync when back online.

## License

MIT
