# API Reference — Spider Link Solution

All routes are Next.js 15 Route Handlers under `src/app/api/`. They run on the
Node.js runtime (`runtime = "nodejs"`) and are always dynamic (never statically
cached).

| Item | Value |
| --- | --- |
| Local base URL | `http://localhost:3000` |
| Production base URL | the Vercel deployment URL (`NEXT_PUBLIC_SITE_URL`) |
| Content type | `application/json` |
| Auth | httpOnly JWT cookie `spiderlink_admin` (admin routes only) |
| Money | integer Kenya Shillings (KES), never floats |
| Timestamps | ISO-8601 strings |

## Response envelope

Every route returns the same shape:

```json
{ "ok": true, "data": { } }
```

```json
{ "ok": false, "error": { "code": "validation", "message": "…", "fieldErrors": { } } }
```

| HTTP | `error.code` | Meaning |
| --- | --- | --- |
| 400 | `validation` | Body failed zod validation (`fieldErrors` present) |
| 401 | `unauthorized` | Admin session missing or invalid |
| 403 | `mismatch` | Status lookup phone does not match the reference |
| 404 | `not_found` | Plan, request or reference does not exist |
| 429 | `rate_limited` | In-memory limiter tripped; retry later |
| 503 | — | `/api/health` only: database unreachable |

## Rate limits

The limiter is in-memory (`src/lib/rate-limit.ts`), keyed by IP + user-agent.
It is best-effort on serverless (each instance has its own map). Production
should additionally enable the Turnstile hook described below.

| Scope | Limit |
| --- | --- |
| `POST /api/requests` | 5 per hour per client |
| `POST /api/complaints` | 5 per hour per client |
| `POST /api/auth/login` | 10 per 15 minutes per client |

Both public forms also carry a honeypot field (`website`). When it is filled,
the API returns a fake `ok: true` with an empty `whatsappUrl` and writes
nothing.

---

## Public endpoints

### `POST /api/requests`

Creates an installation request, freezes the plan name / speed / price, and
returns a pre-filled WhatsApp deep link for `254743498210`.

**Body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `fullName` | string 2–80 | yes | |
| `phone` | string 9–20 | yes | Normalized to `+2547XXXXXXXX`; rejected if invalid |
| `altPhone` | string | no | |
| `email` | string | no | Format-checked when present |
| `area` | string 2–120 | yes | Estate / town |
| `county` | string | no | `Kakamega` or `Bungoma` (advisory, never blocks) |
| `landmark` | string ≤ 250 | no | Directions |
| `referrerPhone` | string | no | Referral programme; ignored if equal to the applicant's phone |
| `planId` | string | yes | Must exist in `plans` |
| `speedMbps` | integer 1–1000 | no | Required in practice for the Custom plan; clamped to the pricing rule |
| `installationFeeAccepted` | `true` | yes | Literal `true` |
| `termsAccepted` | `true` | yes | Literal `true` |
| `preferredContactTime` | `morning \| afternoon \| evening \| any` | no | |
| `preferredInstallDate` | string ≤ 30 | no | Free-form date |
| `referralCode` | string ≤ 30 | no | Legacy code field, kept for compatibility |
| `notes` | string ≤ 1000 | no | |
| `website` | string | no | Honeypot — must stay empty |

**Pricing:** the server ignores any client price. Named plans use
`price_override` when set, otherwise `base + (speed − baseSpeed) × perMbps`.
Custom plans are clamped to `[minCustomMbps, maxCustomMbps]` and rounded by the
editable pricing rule (default: nearest 50 KES).

**Example**

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Wanyama",
    "phone": "0712345678",
    "area": "Lurambi",
    "county": "Kakamega",
    "landmark": "Near the Catholic church",
    "referrerPhone": "0722000111",
    "planId": "<plan uuid>",
    "installationFeeAccepted": true,
    "termsAccepted": true,
    "preferredContactTime": "evening"
  }'
```

```json
{
  "ok": true,
  "data": {
    "id": "2f0c…",
    "reference": "SLR-T5B2",
    "planName": "Home",
    "speedMbps": 10,
    "price": 1500,
    "installationFee": 2500,
    "whatsappUrl": "https://wa.me/254743498210?text=…"
  }
}
```

`whatsappUrl` encodes the structured message built by
`buildRequestMessage()` in `src/lib/whatsapp.ts` (reference, customer, plan,
price, location, fee acceptance, referral, notes).

---

### `POST /api/requests/{id}/whatsapp`

Called by the success panel when the visitor clicks **Send to WhatsApp**. It
re-builds the message from the frozen request row, logs an outbound row in
`messages`, sets `requests.whatsappSent = 1` / `whatsappSentAt`, and returns a
fresh deep link.

The `{id}` is the opaque request UUID returned by the create call. No admin
session is required because the visitor has just created the request.

**Body (optional)**

```json
{ "templateKey": "request_confirmation" }
```

**Response**

```json
{ "ok": true, "data": { "whatsappUrl": "https://wa.me/254743498210?text=…" } }
```

---

### `POST /api/complaints`

Creates a complaint and returns a WhatsApp deep link. If the phone matches an
existing customer, the complaint is linked to them. Category `no_connection`
is automatically given `priority = "high"`.

**Body**

| Field | Type | Required |
| --- | --- | --- |
| `fullName` | string 2–80 | yes |
| `phone` | string 9–20 | yes (Kenyan format) |
| `category` | `no_connection \| slow \| billing \| hardware \| moving \| other` | yes |
| `subject` | string 3–120 | yes |
| `description` | string 10–2000 | yes |
| `preferredContactTime` | `morning \| afternoon \| evening \| any` | no |
| `website` | string | no (honeypot) |

```json
{
  "ok": true,
  "data": {
    "id": "…",
    "reference": "CMP-8K3M",
    "whatsappUrl": "https://wa.me/254743498210?text=…"
  }
}
```

---

### `GET /api/plans`

Public price list, read live from the database. Used by client components that
need the current ladder.

```json
{
  "ok": true,
  "data": {
    "installationFee": 2500,
    "firstMonthFree": true,
    "rule": {
      "baseSpeedMbps": 5,
      "basePrice": 1000,
      "pricePerMbps": 100,
      "minCustomMbps": 5,
      "maxCustomMbps": 100,
      "rounding": 50
    },
    "plans": [
      { "id": "…", "slug": "starter", "name": "Starter", "speedMbps": 5, "monthlyPrice": 1000, "isCustom": false }
    ]
  }
}
```

---

### `GET /api/status/{reference}?phoneLast4=5678`

Public request-status lookup. Requires the last four digits of the phone number
on the request as a weak proof of ownership. The reference is upper-cased
before lookup.

```json
{
  "ok": true,
  "data": {
    "reference": "SLR-T5B2",
    "fullName": "John Wanyama",
    "planName": "Home",
    "speedMbps": 10,
    "price": 1500,
    "status": "survey_scheduled",
    "statusMessage": "Your site survey is booked.",
    "createdAt": "2026-10-22 09:14:00",
    "updatedAt": "2026-10-22 11:02:00"
  }
}
```

Statuses: `new`, `contacted`, `survey_scheduled`, `survey_done`, `installed`,
`activated`, `rejected`.

---

### `GET /api/health`

Uptime probe. Runs `select 1` against the database.

```json
{ "ok": true, "db": "up", "version": "1.0.0" }
```

Returns `503` with `{ "ok": false, "db": "down" }` when the database is
unreachable.

---

## Admin endpoints

Admin pages and admin JSON routes are protected by `src/middleware.ts`
(`/admin/:path*`). The session is a `jose` JWT in the httpOnly cookie
`spiderlink_admin`; `GET`/`POST` handlers additionally call
`getSessionAdmin()` before touching data.

### `POST /api/auth/login`

```json
{ "email": "owner@spiderlink.co.ke", "password": "…" }
```

- Argon2id verification against `admins.password_hash`.
- Inactive accounts are rejected.
- Every attempt (success or failure) writes an `audit_log` row with the IP.
- Success sets the session cookie and updates `lastLoginAt`.

```json
{ "ok": true, "data": { "name": "Owner", "role": "owner" } }
```

### `DELETE /api/auth/login`

Clears the session cookie. Returns `{ "ok": true }`.

### `GET /api/admin/messages`

Returns the 200 most recent message-log rows (all channels/directions).
Requires an admin session.

### `POST /api/admin/messages`

Logs an outbound WhatsApp message and returns the `wa.me` link. Requires an
admin session.

```json
{
  "toPhone": "254712345678",
  "body": "Hello John, your installation is booked for Friday.",
  "requestId": "optional",
  "customerId": "optional",
  "complaintId": "optional",
  "templateKey": "install_schedule"
}
```

```json
{ "ok": true, "data": { "whatsappUrl": "https://wa.me/254712345678?text=…" } }
```

## Admin writes (Server Actions)

The rest of the admin panel writes through **Next.js Server Actions** in
`src/app/admin/actions.ts`, not JSON routes. They validate with the same zod
schemas, enforce the owner/agent role, and append to `audit_log`:

| Action | Effect |
| --- | --- |
| `loginAction` / `logoutAction` | Session handling from HTML forms |
| `updateRequestAction` | Status, payment flag, admin notes |
| `convertRequestAction` | Creates the customer record |
| `updateCustomerAction` | Plan/status/notes |
| `updateComplaintAction` | Status, priority, reply, resolution |
| `savePlanAction` / `deletePlanAction` | Plan ladder CRUD |
| `saveSettingsAction` | Every scalar setting (prices, fee, copy, contact, referral) |
| `saveContentBlockAction` / `deleteContentBlockAction` | Features, steps, FAQ, coverage, counties, technicians |
| `createUserAction` / `updateUserAction` | Owner-only admin management |
| `grantReferralRewardAction` | Marks a referrer's award as granted for N days |

## Credentials & environment variables

Copy `.env.example` to `.env.local` for development. Set the same values in
Vercel → Project → Settings → Environment Variables for production.

| Variable | Required | Where to get it |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | yes | [turso.tech](https://turso.tech) → create a database → `turso db show <db> --url`. Use `file:./local.db` locally. |
| `TURSO_AUTH_TOKEN` | production | `turso db tokens create <db>` (not needed for local files) |
| `SESSION_SECRET` | yes | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SEED_ADMIN_EMAIL` | seed only | The owner's login email |
| `SEED_ADMIN_PASSWORD` | seed only | Strong password, change after first login |
| `SEED_ADMIN_NAME` | seed only | Display name |
| `NEXT_PUBLIC_SITE_URL` | yes | Local: `http://localhost:3000`; production: the Vercel URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | yes | `254743498210` (0743 498 210) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | optional | [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) → Add site. **Reserved — not enforced in v1.** |
| `TURNSTILE_SECRET_KEY` | optional | Same Turnstile widget. Reserved for v1.1. |

### Future credentials (documented now, not used in v1)

| Integration | Variables to add | Source |
| --- | --- | --- |
| Meta WhatsApp Cloud API (v2) | `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` | [developers.facebook.com](https://developers.facebook.com) → Create app → WhatsApp → API Setup. Use a System User permanent token. |
| M-Pesa STK push (v2) | `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_CALLBACK_URL`, `MPESA_ENV` | [developer.safaricom.co.ke](https://developer.safaricom.co.ke) → My Apps. Sandbox first, then production. |
| SMS fallback (future) | `ISPLEDGER_SMS_API_KEY`, `ISPLEDGER_SMS_SENDER_ID` | [sms.ispledger.com](https://sms.ispledger.com/) — account + API credentials. Not built in v1. |

## Notes for integrators

- Never send a price: the server recomputes it and stores a frozen snapshot.
- Requests are idempotent only by phone at the operator level; duplicate
  submissions create separate rows and are flagged in the admin.
- The WhatsApp link is **intent**, not delivery. v1 has no receipts.
- All admin mutations are audited with admin id, action, entity, IP and a
  human-readable detail string.
