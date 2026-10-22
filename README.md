# Spider Link Solution — website + admin dashboard

Marketing site and operations dashboard for Spider Link Solution (home fibre ISP).

- **Public site** — animated 3D landing page, plans with a custom-speed price calculator, installation request form that hands off to WhatsApp, complaint form, request status lookup.
- **Admin panel** (`/admin`) — dashboard, requests, customers, complaints, message log, and a **Content Manager** where every price, plan, fee, word, phone number and payment detail on the site is editable without touching code.

Full requirements: [`docs/PRD.md`](docs/PRD.md) (v1.2). API reference and credential sources: [`docs/API.md`](docs/API.md). AI video prompts for the hero: [`docs/VIDEO-PROMPTS.md`](docs/VIDEO-PROMPTS.md).

---

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first theme in `src/app/globals.css`) |
| 3D | three + @react-three/fiber (procedural scene, no model downloads) |
| Database | Turso/libSQL (local dev falls back to `local.db`) |
| ORM | Drizzle ORM + drizzle-kit |
| Auth | Argon2id password hashes + signed httpOnly session cookie (jose) |
| Deploy | Vercel |

---

## 1. Environment

Copy `.env.example` → `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

| Variable | What it does | Where to get it |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Database connection | `libsql://<db>.turso.io` (prod) or `file:./local.db` (local) |
| `TURSO_AUTH_TOKEN` | Turso auth token | Turso dashboard → the database → token |
| `SESSION_SECRET` | Signs the admin session cookie | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SEED_ADMIN_EMAIL` | First admin account | your email |
| `SEED_ADMIN_PASSWORD` | First admin password | your password |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (used in WhatsApp footers, OG tags) | `https://your-domain` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, e.g. `254743498210` | your number |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Optional CAPTCHA | Cloudflare Turnstile |

`.env.local` is git-ignored. Never put secrets in `NEXT_PUBLIC_*`.

For local development, `.env.development.local` overrides the database with
`file:./local.db`, so `next dev` never touches production data. `.env.local`
holds the production Turso credentials and is what the deploy/Drizzle commands
use.

---

## 2. Run it locally

```bash
npm install
npm run db:migrate               # apply drizzle/ migrations (uses .env.local)
npm run db:seed                  # plans, site content, first admin
npm run dev                      # http://localhost:3000 (uses local.db)
```

Schema changes use `npm run db:generate` (writes a new SQL file into `drizzle/`)
followed by `npm run db:migrate`. `db:push` exists but can fail on re-runs with
`index … already exists`; prefer generate + migrate.

`npm run db:seed` is idempotent — safe to re-run. It seeds:

- Plans: Starter 5 Mbps / Ksh 1,000 · Home 10 / 1,500 · Family 15 / 2,000 · Pro 20 / 3,700 · **Custom** (price calculated)
- Pricing rule: base 5 Mbps = Ksh 1,000, +Ksh 100 per extra Mbps
- Site copy: hero, features, how-it-works, FAQ, coverage (Kakamega + Bungoma), counties, technician crew, legal wording, contact details
- Your owner admin account (from `SEED_ADMIN_*`)

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm run db:push` | Apply schema directly (dev only; can fail on re-runs) |
| `npm run db:migrate` | Apply generated migrations (use this) |
| `npm run db:seed` | Seed plans, content and the first admin |
| `npm run db:generate` | Generate SQL migrations (use for prod schema changes) |
| `npm run db:studio` | Browse the data in Drizzle Studio |

---

## 3. The request → WhatsApp flow

1. Visitor picks a plan (or sets a custom Mbps), enters their **county + exact location**, optionally adds a **referrer's phone**, and fills the form.
2. `POST /api/requests` validates (zod), re-computes the price **server-side** from the live pricing rule, writes the request to the database, and returns a reference (`SLR-4F7Q`) plus a pre-filled WhatsApp link.
3. The visitor taps **Send on WhatsApp** → WhatsApp opens with a formatted message addressed to `+254743498210` → the send is logged and the request is flagged `whatsapp_sent`.
4. If the visitor never presses send, the request is **still in the dashboard** and flagged "Not sent to WhatsApp" so no lead is lost.

Prices are frozen onto the request at submission time — editing the price ladder later never rewrites history.

---

## 4. Admin panel

`/admin` → sign in with the seeded owner account.

| Screen | What you can do |
| --- | --- |
| **Dashboard** | New requests, survey scheduled, active customers, open complaints, "not sent to WhatsApp" count, monthly recurring revenue |
| **Requests** | Filter by status / plan / text, open a request, change status, record notes and payment status, send templated WhatsApp messages |
| **Customers** | Auto-created when a request is set to *activated*; suspend/activate, message directly |
| **Complaints** | Queue with status workflow, resolution notes, one-click WhatsApp reply |
| **Messages** | Every outbound message ever sent, with template and timestamp |
| **Referrals** | Referral progress per referrer (10 activated referrals → 60 extra days free) and a grant action |
| **Site content** | ⭐ **Content Manager** — plans, pricing rule, fees, hero copy, contact details, M-Pesa PayBill, legal/consent wording, features, steps, FAQ, coverage, technician crew, referral programme, testimonials, section toggles |
| **Admins** | Owner only: create owner/agent accounts, deactivate (kills their session instantly) |

Roles: **owner** = everything, **agent** = requests/customers/complaints/messages only.

---

## 5. Deploy to Vercel

The Turso production database is already migrated and seeded. To deploy:

1. Push the repo to GitHub (`sibby-killer/spider_Link`) and import it in
   Vercel (framework: Next.js).
2. In Vercel → Project → Settings → Environment Variables, add **all three
   environments** (Production, Preview, Development):

   | Variable | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | the `libsql://…` URL |
   | `TURSO_AUTH_TOKEN` | the Turso token |
   | `SESSION_SECRET` | the same 64-char secret (or a new one — this logs everyone out) |
   | `NEXT_PUBLIC_SITE_URL` | the Vercel URL (or custom domain) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `254743498210` |

3. Deploy. No build-time database access is required.
4. Sign in at `/admin` with the seeded owner account and change the password.
5. Attach the domain later and update `NEXT_PUBLIC_SITE_URL` — WhatsApp
   footers and OG tags read it automatically.

For future schema changes: apply them once from your machine with
`npm run db:migrate` (this reads `.env.local`, which points at Turso), then
redeploy.

**Never commit `.env.local`.** It is git-ignored; rotate the Turso token in the
dashboard if it is ever exposed.

---

## 6. Project layout

```
src/
  app/
    page.tsx                 landing page
    request/ complaint/ status/
    admin/                   dashboard, requests, customers, complaints, messages, referrals, site, users
    api/                     requests, complaints, plans, status, auth, admin/messages, health
  components/                landing + admin components
  db/                        schema.ts, index.ts, seed.ts
  lib/                       pricing, site-config, whatsapp, auth, validation, rate-limit
docs/PRD.md                  requirements (v1.2)
docs/API.md                  API reference + where to get each credential
docs/VIDEO-PROMPTS.md        AI video prompts for the hero loop
public/brand/                logo + placeholder spider mark
```

---

## 7. Notes

- The supplied logo is a raster PNG on white. `public/brand/spider-mark.svg` is a hand-built placeholder of the spider + Wi-Fi mark — drop the real file in as `logo-mark.svg`/`logo-mark.png` and update `src/components/Logo.tsx`.
- `wa.me` links have no delivery receipts. The dashboard tracks *intent*; the real funnel is the status flow (`contacted → survey_scheduled → installed → activated`).
- M-Pesa STK push and the WhatsApp Cloud API are deliberately deferred — see PRD §14. The pricing/payment columns and the `WhatsAppSender` shape are already in place for them.
- SMS is not built. The provider is identified as [iSpLedger](https://sms.ispledger.com/); credentials and env names are listed in `docs/API.md` for a future integration.
