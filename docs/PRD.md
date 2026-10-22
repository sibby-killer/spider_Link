# PRD — Spider Link Solution (Customer & Admin Web Platform)

| Field | Value |
| --- | --- |
| Product | Spider Link Solution — Unlimited Fiber to Your Home |
| Version | **v1.2** (PRD for sign-off) |
| Status | Draft → pending stakeholder sign-off |
| Owner | Spider Link Solution (ISP operator) |
| Stack | Next.js 15 (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · Turso/libSQL · Vercel |
| WhatsApp sink | **0743 498 210** (wa.me target, all inbound requests) |
| Domain | Deferred — launch on the Vercel URL, attach a domain later |

### Changelog

| Version | Change |
| --- | --- |
| v1.0 | Initial PRD (original flyer pricing 5/7/10/20/30 Mbps) |
| **v1.1** | New price ladder (5/10/15/20 Mbps + **custom Mbps calculator**); **Content Manager** — every price, plan, fee, word and setting editable from the admin panel with no developer; tone guidance ("friendly, not over-engineered"); scope trimmed (see §1.3) |
| **v1.2** | Launch coverage set to **Kakamega + Bungoma**; county selector + exact location on the request form; **installation crew** section with three named technicians and cursor-reactive characters; **referral programme** (10 activated referrals → 60 extra days free) with referrer-phone capture and an admin referrals page; iSpLedger SMS documented as a future integration |

---

## 1. Overview

Spider Link Solution currently sells home fiber broadband through WhatsApp calls and physical flyers. Sign-ups are manual, leads are lost between messages, and the operator has no single place to see who requested what, who is a live customer, or who has an open complaint.

This product replaces that with a two-part web platform:

1. **Public landing page** — a fast, animated 3D marketing site that sells the 5 broadband plans and captures installation requests in a structured form.
2. **Admin panel** — a private dashboard where the operator triages requests, manages customers, sends WhatsApp messages to any user, and resolves complaints.

**Core loop:** Visitor reads plans → submits request (name, location, plan, installation-fee acceptance) → request is saved to the database *and* handed to the operator's WhatsApp as a pre-filled, structured message → operator triages in the admin panel → customer becomes an active customer → customer can lodge a complaint from the site → operator resolves it and replies via WhatsApp.

### 1.1 Goals

| # | Goal | Success metric |
| --- | --- | --- |
| G1 | Convert visitor → qualified installation request | Form completion rate ≥ 8% of landing sessions |
| G2 | Zero-friction handoff to WhatsApp | 100% of submitted requests reach WhatsApp pre-filled with structured data |
| G3 | Operator sees every request in one place | Zero leads outside the admin panel (no leads buried in chat history) |
| G4 | Two-way customer communication | Operator can message any customer/lead from the admin panel with one click |
| G5 | Complaint handling with accountability | Every complaint has a status, owner, reply, and resolution timestamp |
| G6 | Premium brand impression | Animated 3D hero loads in < 2.5s on 4G mobile; Lighthouse Performance ≥ 85 |
| G7 | **Operator autonomy** — the operator can change prices, plans, fees, copy, payment details, features, FAQ and contact info from the admin panel without a developer or a redeploy | 100% of commercial content editable in admin; **zero** hardcoded prices, fees or copy in the codebase |
| G8 | Friendly, human brand | Visitor-facing copy is warm and plain-spoken; no jargon, no dark patterns, no scary legal walls |

### 1.3 Scope discipline ("friendly, not over-engineered")

This product is for **one operator** selling fibre to homeowners. The guiding rule: *if it does not help a customer request installation, help the operator close a request, or let the operator change what the site says, it does not ship in v1.*

Deliberately excluded from v1 (already noted, restated here as principles):

- **No account system for customers.** Visitors never log in. One form, one WhatsApp handoff.
- **No cart or checkout.** The installation fee is an *acceptance*, collected manually (§1.2).
- **No multi-page app for customers.** The public site is a landing page plus three utility routes (request, complaint, status).
- **No over-designed UI.** One visual language, one motion family, one shared component kit. Delight comes from the hero animation and the clarity of the form — not from UI complexity.
- **No speculative abstractions.** The pricing rule and the content model are simple and table-driven; the only interface worth defining is `WhatsAppSender` (§8), because it has a known v2 upgrade path.
- **Nothing that needs the operator to keep two places in sync.** The admin panel is the single source of truth; the site renders from it.

### 1.2 Non-goals (v1)

- Real-time online payment collection (M-Pesa STK push → v2, see §14)
- Customer self-service portal / billing history (v2)
- SMS or email notifications (only WhatsApp in v1; the iSpLedger SMS provider at `https://sms.ispledger.com/` is documented for a future integration, §14)
- Automatic WhatsApp replies via Cloud API (v2 — v1 uses `wa.me` deep links, §8)
- Network provisioning, router stock control, or payment reconciliation
- Multi-language (Swahili/English) UI (v2; content copy is centralized so it is translation-ready)

---

## 2. Brand & Content Inventory (from supplied assets)

Source of truth: the supplied flyer banner and the Spider Link Solution logo.

### 2.1 Brand identity

| Token | Value | Usage |
| --- | --- | --- |
| Brand red | `#E60000` (primary), `#B30000` (deep/hover), `#FFE5E5` (tint) | Logo, headings, CTAs, price badges |
| Ink | `#0B0B0B` | Body text, dark sections |
| Paper | `#FFFFFF` / `#F7F7F8` | Page and card surfaces |
| Tagline | "Unlimited Fiber To Your Home" | Hero headline |
| Sub-tagline | "Fast. Stable. Reliable Internet!" | Hero support line |
| Wordmark | "SPIDER LINK" + "SOLUTION" (letterspaced) | Header / footer / 3D-adjacent brand frame |
| Logo mark | Angular red spider with Wi-Fi arcs over the abdomen | Favicon, header, loading screen, 3D scene fallback |

**Asset handling:** the supplied logo is a raster PNG with a white background. Deliverables: `public/brand/logo-mark.png` (transparent, 512×512), `public/brand/logo-full.png` (transparent, horizontal lockup), `public/brand/logo-mark.svg` (vectorized for crispness + used to build the 3D emblem), `public/brand/banner.jpg` (the flyer, used for the "print flyer" callout / OG fallback). Until the transparent PNG is supplied, an SVG recreation of the spider mark ships as `public/brand/spider-mark.svg` (see §11.6) and is treated as placeholder art.

### 2.2 Product catalogue (v1.1 — updated by client)

The 7 Mbps tier is retired. The ladder is now:

| Plan | Speed | Monthly price | Notes |
| --- | --- | --- | --- |
| **Starter** | 5 Mbps | Ksh 1,000 | Entry plan, base of the price ladder |
| **Home** | 10 Mbps | Ksh 1,500 | Most popular (flagged "Popular") |
| **Family** | 15 Mbps | Ksh 2,000 | Streaming households |
| **Pro** | 20 Mbps | Ksh 3,700 | Premium tier |
| **Custom** | *any* Mbps | *calculated* | Customer picks their own speed; price auto-computed (§2.5) |

> ⚠️ **To confirm:** the 20 Mbps tier at Ksh 3,700 does not follow the ladder's pattern (5→+500 per 5 Mbps gives Ksh 2,500). It is seeded exactly as specified and treated as a **manually-overridden price** in the admin, so it can be corrected by the operator with one field edit — no code change.

All of the above is **seed data only**. Nothing is hardcoded: the operator can rename, re-price, reorder, hide or add plans from the admin panel (§5.8), and the landing page and form update immediately.


### 2.3 Commercial terms (from banner)

- **Installation fee:** Ksh 2,500 — includes router + installation & setup.
- **First month FREE** on all plans.
- **Unlimited broadband**, no data caps.
- **Flexible payment.**
- **Terms and Conditions apply.**
- **Installation/activation is dependent on a survey** (site survey determines feasibility/activation date).
- **24/7 Customer Service.**
- **Phones / WhatsApp:** 0762667048 · 0743498210 (WhatsApp sink = **0743498210**).
- **National fibre, unlimited to the home.**
- **Main service area:** Kakamega (home base) plus Bungoma county. Coverage is advisory — a lead is never blocked; the exact estate/street is confirmed by a quick site survey.
- **Installation crew:** Alfred Nyongesa (0762 667 048) · Samuel Ogachi (0768 294 174) · Isaac Amutambi (0729 826 792).
- **Referral programme:** refer a friend; after **10 successfully installed referrals** the referrer gets **60 extra days free** on their current plan.

> **Legal note (must appear on-page):** because activation depends on a site survey, the form must not promise an activation date. The CTA copy is *"Request Installation"*, not *"Get Installed Today"*, and the confirmation states that final activation is subject to a survey.

### 2.4 Voice

Confident, short, benefit-first. Kenyan market. Avoid "unlimited = no rules" — always pair "unlimited" with the T&C footnote.

**Friendly register (v1.1 mandate).** The operator is selling to neighbours, not enterprises. Write like a helpful neighbour, not a bank:

| Instead of | Write |
| --- | --- |
| "Subscribe to our premium fibre package" | "Get fast fibre for your home" |
| "Installation fee payable prior to activation" | "Ksh 2,500 for the router and setup — pay once, and your first month is free" |
| "Terms and conditions apply" (alone) | "By requesting, you agree to our simple terms — no hidden charges" |
| "Subject to a site survey" (alone) | "We do a quick site check to make sure fibre reaches your home" |
| Error: "Invalid input" | Error: "Please enter a valid phone number, e.g. 0712 345 678" |

Rules: second person ("your home", not "the customer"); short sentences; no exclamation-mark stacking; one idea per sentence; always name the next step.

### 2.5 Pricing model (admin-editable)

The price ladder is **data**, not code. Two layers:

**Layer 1 — the named ladder.** Each plan row carries `speed_mbps` + `monthly_price` + `price_override`. If `price_override` is set, that exact amount is charged regardless of the rule (this is how 20 Mbps = Ksh 3,700 works). If it is empty, the price is computed by Layer 2.

**Layer 2 — the calculation rule** (editable in admin → Pricing):

```
base_speed_mbps   = 5      →  base_price = Ksh 1,000
price_per_mbps    = 100    →  each additional Mbps adds Ksh 100
```

```
price(mbps) = base_price + max(0, mbps - base_speed_mbps) × price_per_mbps
```

Worked examples at the seeded rule:

| Custom speed | Calculation | Price |
| --- | --- | --- |
| 8 Mbps | 1000 + (8−5)×100 | **Ksh 1,300** |
| 25 Mbps | 1000 + (25−5)×100 | **Ksh 3,000** |
| 30 Mbps | 1000 + (30−5)×100 | **Ksh 3,500** |
| 50 Mbps | 1000 + (50−5)×100 | **Ksh 5,500** |
| 5 Mbps | 1000 + 0 | **Ksh 1,000** |

**Admin controls for the rule:** `base_speed_mbps`, `base_price`, `price_per_mbps`, `min_custom_mbps`, `max_custom_mbps`, and `rounding` (round to nearest 50 Ksh — recommended, keeps prices tidy). Changing the rule instantly changes every computed price on the site.

**Rules for custom requests:**
- The customer picks a speed with a slider/stepper (or types it) and sees the price update live before submitting.
- The chosen speed **and** the computed price are frozen onto the request row at submission time, so a later rule change never rewrites history.
- The custom price is presented as "from Ksh X/month" until submitted, then confirmed exactly.
- Below the minimum speed, the input is clamped and the customer is nudged to the nearest available plan.
- A hand-typed speed that beats the ladder but is not a named plan is fine — that is the whole point of Custom.
- The admin may override any request's plan/price after the fact (e.g. a negotiated corporate install) without touching the ladder.

### 2.6 Coverage, installation crew & referral programme (v1.2)

**Coverage.** The launch territory is **Kakamega** (home base) and **Bungoma**
county. Both appear in the landing-page coverage section and in the request
form's county selector. The list is stored as `county` content blocks and is
editable in the Content Manager, so adding a county later is a data edit, not a
release. The form never rejects an out-of-county lead — it records the county
and exact location and lets the operator confirm coverage during the survey
call.

**Crew.** Three named technicians are shown on the landing page with animated
SVG characters: heads and eyes follow the pointer; a character waves when
hovered. Each card shows name, role, coverage area and a `tel:` link. Crew
data is stored as `technician` content blocks (name, body, phone, role, area,
accent colour) and is editable in the Content Manager. Contact details:

| Technician | Role | Phone |
| --- | --- | --- |
| Alfred Nyongesa | Lead Technician | 0762 667 048 |
| Samuel Ogachi | Installation Technician | 0768 294 174 |
| Isaac Amutambi | Setup & Support Technician | 0729 826 792 |

**Referral programme.** The request form carries an optional *referrer phone*
field and a friendly note ("we are still growing…"). A referral counts only
when the referred request reaches `activated`. At **10 successful referrals**
the referrer earns **60 extra days free** on their current plan. Both the
target (10) and reward (60 days) are editable settings
(`referral_target_count`, `referral_reward_days`). The admin **Referrals** page
shows each referrer's progress bar and a "Grant N days" action; the grant is
recorded in `referral_awards` with a timestamp and an audit entry. The website
does not claim or process any cash payout.

> The reward is applied manually in v1 (no billing engine). A future billing
> integration will read `referral_awards.days_granted` and credit the invoice
> automatically.



---

## 3. Users & Permissions

| Role | Who | Access |
| --- | --- | --- |
| **Visitor** | Prospective customer | Landing page, request form, complaint form |
| **Customer** | Someone with an active connection | Landing page, request form, complaint form, "check my request status" (v1: via WhatsApp link) |
| **Admin — Owner** | The operator | Full admin: all requests, customers, complaints, messages, plans, settings, admin management |
| **Admin — Agent** | Support staff (v1 optional) | All requests/customers/complaints; **cannot** edit settings, plans, or manage admin accounts |

Authorization model: role checked on every admin API route (server-side), **not** only hidden in the UI.

---

## 4. Information Architecture

```
/                         Landing page (public)
  #hero                   3D scene + headline + dual CTA
  #features               6 features from banner
  #plans                  5 plan cards (select → opens request form)
  #how-it-works           4-step process
  #coverage               Where we serve + why us (24/7, fibre, terms)
  #technicians            Meet the installation crew (animated characters)
  #install-fee            Ksh 2,500 installation, first month free CTA
  #faq                    Objections: coverage, activation, contract, support
  #complaint              Complaint form (also standalone route)
  #contact                Phones, WhatsApp, location/map, hours
  #request                  Dedicated request form route (deep-linkable, prefilled plan)
  #complaint                Standalone complaint form route
  #status/[reference]       Public request status lookup (reference + phone last-4)
/admin                    Dashboard
  /admin/login            Admin sign-in
  /admin/requests         Requests table + detail drawer
  /admin/customers        Customers table + detail drawer
  /admin/complaints       Complaints queue
  /admin/messages         Message log (outbound + inbound notes)
  /admin/referrals        Referral progress + reward grants
  /admin/site             **Content Manager** — everything the public site shows
    /admin/site/plans     Plans ladder + custom-price rule
    /admin/site/pricing   Installation fee, first-month-free, price rule, rounding
    /admin/site/content   Hero copy, features, how-it-works, FAQ, coverage, testimonials
    /admin/site/payments  M-Pesa PayBill details, payment instructions, bank details
    /admin/site/contact   Phones, WhatsApp number, email, support hours, address
    /admin/site/legal     T&C text, privacy note, consent wording on the form
    /admin/site/brand     Colours, logo, tagline, favicon, announcement bar
  /admin/users            Admin account management (Owner only)
```

The **Content Manager** is one panel with seven tabs, not seven separate systems. The operator opens it, sees a tab per area, edits, presses Save, and the public site reflects it. Everything is stored as rows in `settings` (single values) and `content_blocks` (repeating items like features, FAQ entries, coverage areas, testimonials) — both editable through the same admin UI.

```

---

## 5. Functional Requirements

### 5.1 Landing page

| ID | Requirement | Priority |
| --- | --- | --- |
| LP-1 | Hero renders the animated 3D scene (§11) with headline "Unlimited Fiber To Your Home", sub-line "Fast. Stable. Reliable Internet!", primary CTA "Request Installation" (scrolls to form), secondary CTA "View Plans" | Must |
| LP-2 | Header: logo (SVG), nav (Features, Plans, How it works, FAQ, Contact, Track Request), sticky, transparent over hero → solid white after scroll | Must |
| LP-3 | Feature strip reproducing the 5 banner features + "Unlimited Fibre" (6 tiles, red check icons) | Must |
| LP-4 | Plan grid: 4 named plan cards (name, speed, monthly price, "First Month FREE" ribbon, "Install Ksh 2,500" line) + a **Custom** card with an interactive Mbps stepper and a live-computed price. Each card has a "Choose plan" button that deep-links into `/request?plan=<slug>` (custom carries `&speed=<n>`) | Must |
| LP-5 | How-it-works: Request → Site survey → Installation & setup → Go live (4 steps) | Must |
| LP-6 | Coverage section: service area list + "Not sure? WhatsApp us" CTA | Should |
| LP-7 | Installation-fee band: "Installation Ksh 2,500 (router + installation & setup). First month FREE." + CTA | Must |
| LP-8 | FAQ accordion (≥ 6 Q&A) covering coverage, activation/survey, contract terms, installation fee, first month free, support hours, moving house | Must |
| LP-9 | Complaint entry point visible in nav, footer, and a dedicated section — "Already a customer? Report a problem" | Must |
| LP-10 | Contact block with both phone numbers (tel: links), WhatsApp button → 0743498210, hours, service area | Must |
| LP-11 | Footer: logo, nav, contact, T&C note, "Powered by Spider Link Solution" | Must |
| LP-12 | Floating WhatsApp bubble (bottom-right) on all public pages | Should |
| LP-13 | **Technicians** section: three animated characters (SVG) that track the pointer with their heads/eyes and wave on hover; each card shows name, role, area and a `tel:` link | Must |
| LP-14 | **Referral callout** on the request page and a short mention on the landing page: refer a friend, 10 activated referrals → 60 extra days free; includes the "we are still growing" note | Should |

### 5.2 Request form (the core conversion asset)

| ID | Requirement | Priority |
| --- | --- | --- |
| RF-1 | Fields: Full name* · Phone number* (KE format, `07xxxxxxxx` / `+2547xxxxxxxx`, validated) · Alternative phone (optional) · Email (optional) · **Plan*** (pre-selected if arrived from a plan card) · **Custom speed** (if Plan = Custom: Mbps stepper + live-computed price) · **County*** (select: Kakamega / Bungoma — plus any counties the operator adds) · **Exact location / estate*** (e.g. "Lurambi, Shieywe") · **Landmark or description** (e.g. "near Amani Centre") · **Installation fee acceptance checkbox*** ("I accept the Ksh 2,500 installation fee — router + installation & setup") · **Terms acceptance checkbox*** · Preferred contact time (select) · Preferred install date (date, optional) · **Referrer phone** (optional, for the referral programme) · Notes (optional) | Must |
| RF-1b | The price shown next to the plan (named *and* custom) is **read from the live pricing rule** in the database, computed client-side for instant feedback and re-verified server-side on submit — the server value always wins | Must |
| RF-1c | Submitting a custom plan freezes `speed_mbps` + `monthly_price` onto the request row, so later price edits never rewrite history | Must |
| RF-2 | Validation: required + format checks inline on blur, Kenyan phone normalization to `+254…`, error summary at top, submit disabled until required fields valid, no zombie submits (button `disabled` + `aria-busy`) | Must |
| RF-3 | Honeypot field + min-time-to-submit (bot heuristic) | Should |
| RF-4 | On success: writes `requests` row, generates human reference (e.g. `SLR-4F7Q`), shows a success panel with reference + summary + "Send to WhatsApp" primary button + "Copy details" + "Track status" link | Must |
| RF-5 | "Send to WhatsApp" opens `https://wa.me/254743498210?text=<encoded structured message>` (§8.2) in a new tab; the WhatsApp send is recorded in the DB as an outbound message | Must |
| RF-6 | If the visitor abandons before clicking WhatsApp, the request still exists in the admin panel with `waClicked = false` — the admin can re-send from the dashboard | Must |
| RF-7 | Anti-spam: max 3 submissions per device per hour (IP + fingerprint), CAPTCHA (Turnstile) only if spam volume > threshold | Should |

### 5.3 Complaint form (public)

| ID | Requirement | Priority |
| --- | --- | --- |
| CP-1 | Fields: Name* · Phone* · Account/phone link (optional) · Category (select: No connection / Slow speed / Billing / Router or hardware / Moving house / Other) · Subject* · Description* · Preferred contact time | Must |
| CP-2 | Creates a `complaints` row, generates reference `CMP-XXXX`, shows confirmation + WhatsApp escalation button (pre-filled complaint summary → 0743498210) | Must |
| CP-3 | If the phone matches an existing customer, auto-link `customerId` and prefill their plan on the admin side | Should |
| CP-4 | Public lookup `/status/[reference]` lets a customer check request status with reference + last 4 digits of phone | Should |

### 5.4 Admin — authentication

| ID | Requirement | Priority |
| --- | --- | --- |
| AU-1 | Admin users stored in DB (`admins`): email, name, password hash (bcrypt/argon2, cost ≥ 12), role, active flag, last login | Must |
| AU-2 | Seed script creates the first Owner account from env vars (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`); seeding is idempotent and safe to re-run | Must |
| AU-3 | Login form at `/admin/login` — email + password, generic error message ("Invalid email or password"), no user enumeration | Must |
| AU-4 | Session = signed JWT (jose) in an `httpOnly`, `secure`, `sameSite=lax` cookie, 7-day expiry, containing `adminId` + `role`; middleware protects `/admin/*` (except login) and all `/api/admin/*` | Must |
| AU-5 | Every admin API request re-validates the session and the `active` flag in the DB → deactivating an admin kills their session immediately | Must |
| AU-6 | Rate limit login attempts (5 per 15 min per IP+email) with generic error; log every login attempt (success/failure) in an `audit_log` | Must |
| AU-7 | Logout clears the cookie and invalidates the session server-side (token version bump or denylist) | Must |
| AU-8 | Owner can create/edit/deactivate other admins and reset passwords (Owner-only) | Must |

### 5.5 Admin — dashboard & requests

| ID | Requirement | Priority |
| --- | --- | --- |
| AD-1 | Dashboard KPIs: new requests (last 7/30 days), requests awaiting survey, active customers, open complaints, WhatsApp sends vs. total requests, revenue indicator (active customers × plan price) | Must |
| AD-2 | Requests table: reference, name, phone, area, plan, status, install-fee acceptance, WhatsApp sent?, created date. Filters by status / plan / area / date; free-text search on name/phone/reference; sortable; paginated | Must |
| AD-3 | Request detail drawer: all submitted data, admin notes (timestamped), status timeline, and actions: change status, toggle installation fee accepted, mark survey scheduled, convert to customer, send WhatsApp message, call customer | Must |
| AD-4 | Statuses: `new` → `contacted` → `survey_scheduled` → `survey_done` → `installed` → `activated` → `rejected`; each transition recorded with timestamp + admin | Must |
| AD-5 | Bulk actions: bulk status update, bulk WhatsApp template message to selected requests | Should |
| AD-6 | Export requests to CSV | Should |
| AD-7 | Request detail shows the county and "referred by" phone; admin can filter the requests table by county | Must |
| AD-8 | **Referrals page**: each referrer phone with referral count, progress toward the target (default 10), reward days (default 60), status, and a "Grant N days" action that writes `referral_awards` + audit log | Must |

### 5.6 Admin — customers & messaging

| ID | Requirement | Priority |
| --- | --- | --- |
| CU-1 | Customers list (auto-created from activated requests, or created manually): name, phone, plan, account number, area, install date, status (`active`/`suspended`/`churned`), monthly price | Must |
| CU-2 | Customer detail: plan, request history, complaints, message history, notes, plan change / suspend / reactivate actions | Must |
| CU-3 | "Send message" button on any customer/request opens a composer with template presets (Install schedule, Site survey booking, Payment reminder, Subscription renewal, Welcome, Suspension notice, Promotional offer) + free text; the message is logged to `messages` and opens `wa.me` prefilled to the user's number | Must |
| CU-4 | Message templates support placeholders: `{{name}}`, `{{plan}}`, `{{price}}`, `{{reference}}`, `{{amount}}` | Must |
| CU-5 | Message log page: direction (outbound/inbound), channel, body, who sent it, timestamp, target phone | Must |
| CU-6 | Inbound capture: when a customer replies on WhatsApp, the admin can paste/forward the reply into the log ("Log inbound reply") so the thread stays in one place | Should |

### 5.7 Admin — complaints

| ID | Requirement | Priority |
| --- | --- | --- |
| CM-1 | Complaints queue: reference, name, phone, category, subject, status, age, assigned agent | Must |
| CM-2 | Complaint detail: full description, linked customer/plan (auto-enriched), status workflow (`open` → `in_progress` → `resolved` → `closed`), internal notes, public reply, resolution timestamp, and "Reply via WhatsApp" | Must |
| CM-3 | SLA badge: complaints open > 48h are flagged amber, > 72h red | Should |
| CM-4 | Admin can create a complaint manually (phone support) | Should |

### 5.8 Admin — Content Manager (everything the site shows)

**Principle: the operator never asks a developer to change a price, a fee, a phone number or a sentence.** The public site renders from the database; the admin panel writes to it.

Every field below is editable and saved from the panel. Changes appear on the public site within seconds (public pages are revalidated on write).

| ID | Area | Editable content | Priority |
| --- | --- | --- | --- |
| CM-P1 | **Plans** | Add / edit / reorder / hide / delete plans: name, speed Mbps, monthly price (Ksh), price override toggle, badge label (e.g. "Popular"), short description, icon, active flag. Delete is soft (archive) so historical requests keep their plan reference | Must |
| CM-P2 | **Pricing rule** | `base_speed_mbps`, `base_price`, `price_per_mbps`, `min_custom_mbps`, `max_custom_mbps`, rounding step. A live "preview" panel shows what each custom speed would cost, and warns if the rule contradicts a named plan's override price | Must |
| CM-P3 | **Fees & offers** | Installation fee amount, what it includes ("Router + installation & setup" — editable), first-month-free toggle + label, any promotional banner text, optional discount code (amount / percent, validity window) | Must |
| CM-P4 | **Hero & header** | Eyebrow text, H1 headline, sub-headline, primary CTA label, secondary CTA label, announcement bar text + toggle, brand tagline, hero 3D scene toggle (on/off) and its accent colour | Must |
| CM-P5 | **Features** | Add / edit / reorder / hide feature tiles: icon, title, description. Seeded with the 5 banner features + "Unlimited Fibre" | Must |
| CM-P6 | **How it works** | Editable step list (number, title, description), typically 4 steps: Request → Site survey → Installation → You're online | Must |
| CM-P7 | **Coverage** | Editable list of served towns/estates with optional per-area note ("Same-day install"), plus a friendly note that coverage is confirmed by survey | Must |
| CM-P8 | **FAQ** | Add / edit / reorder / hide Q&A pairs | Must |
| CM-P9 | **Testimonials** | Add / edit / hide customer quotes (name, area, quote, plan, rating) — optional section, off by default | Should |
| CM-P10 | **Payments** | M-Pesa PayBill number, account-name format, how-to-pay instructions (free text), whether the installation fee is payable before or on installation day, accepted methods, and the payment reminder text used in WhatsApp templates | Must |
| CM-P11 | **Contact & channels** | Primary phone, secondary phone, WhatsApp number (the sink), business email, support hours, office location, map/area text, social links | Must |
| CM-P12 | **Legal & consent** | Terms & conditions text (rich text, shown in a modal/page), privacy note, and the *exact wording* of the two consent checkboxes on the request form | Must |
| CM-P13 | **Branding** | Primary/accent colour pickers, logo file upload (replace `logo-mark`), favicon, and a live preview | Should |
| CM-P14 | **Footer & misc** | Footer text, copyright line with year, "powered by" text, section visibility toggles for every landing section | Should |
| CM-P15 | **Audit of content edits** | Every content change writes an `audit_log` row (who, what, before → after) so the operator can see what they changed last week | Should |
| CM-P16 | **Coverage & crew** | Counties list (Kakamega, Bungoma, + add/remove), estates per county, and the technician roster: name, role, phone, area, accent colour, visibility | Must |
| CM-P17 | **Referral programme** | On/off toggle, the explanatory note ("we are still growing…"), target referral count (default 10), reward days (default 60), and the reward wording used on the site | Must |

**Implementation notes**

- Settings live in `settings` (key/value, typed) — e.g. `install_fee`, `first_month_free`, `hero_title`, `whatsapp_number`, `mpesa_paybill`, `rule_base_price`.
- Repeating content lives in `content_blocks` — `(id, kind, position, title, subtitle, body, meta_json, is_visible)` where `kind` ∈ `feature | step | faq | coverage_area | testimonial | plan` (plans get their own table for query efficiency).
- The public site fetches settings + plans through a single typed `getSiteConfig()` server function that applies defaults, so a missing key never crashes the page.
- Writes are validated with the same zod schemas used by the public API; the admin UI uses inline field errors.
- Price changes are **versioned on requests** (frozen values), never retroactively applied.

### 5.9 Admin — users & audit

| ID | Requirement | Priority |
| --- | --- | --- |
| AU-8 | Owner can create/edit/deactivate other admins and reset passwords (Owner-only). Roles: `owner` (everything) and `agent` (requests, customers, complaints, messages + content read, no settings/plan edits, no user management) | Must |
| AU-9 | Audit log page lists recent admin actions: login, request status change, message sent, complaint updated, content edit, settings change, user created | Must |


---

## 6. Data Model (Drizzle / Turso)

Turso/libSQL — SQLite dialect. Timestamps stored as ISO-8601 text (`text` with `default(sql\`CURRENT_TIMESTAMP\`)`), booleans as `integer` (0/1), money as integer KES (never float). IDs: `text` primary keys generated client-side (`crypto.randomUUID()`).

```
admins
  id            text PK
  email         text UNIQUE NOT NULL
  name          text NOT NULL
  password_hash text NOT NULL              -- argon2id / bcrypt cost>=12
  role          text NOT NULL default 'agent'   -- 'owner' | 'agent'
  is_active     integer NOT NULL default 1
  token_version integer NOT NULL default 0  -- bump to revoke sessions
  last_login_at text
  created_at    text NOT NULL default CURRENT_TIMESTAMP
  updated_at    text NOT NULL

plans
  id             text PK
  slug           text UNIQUE NOT NULL       -- 'starter' | 'home' | 'family' | 'pro' | 'custom'
  name           text NOT NULL              -- 'Starter'
  speed_mbps     integer NOT NULL
  monthly_price  integer NOT NULL          -- KES (computed or overridden at save time)
  price_override integer                   -- set => exact price wins over the rule; null => computed
  is_custom      integer NOT NULL default 0 -- 1 => customer picks their own Mbps
  tagline        text
  description    text
  icon           text NOT NULL default 'plug'  -- plug|wifi|couch|router|gear
  badge          text                      -- e.g. 'Popular'
  sort_order     integer NOT NULL default 0
  is_active      integer NOT NULL default 1
  created_at     text NOT NULL
  updated_at     text NOT NULL

settings                 -- key/value content + configuration (typed at the app layer)
  key   text PK
  value text NOT NULL     -- JSON-encoded value (string | number | boolean | object)

content_blocks           -- repeating editable content
  id         text PK
  kind       text NOT NULL    -- 'feature' | 'step' | 'faq' | 'coverage_area' | 'testimonial'
  position   integer NOT NULL default 0
  title      text
  subtitle   text
  body       text
  meta_json  text            -- JSON: { icon, value, note, rating, plan, area }
  is_visible integer NOT NULL default 1
  created_at text NOT NULL
  updated_at text NOT NULL

requests
  id                       text PK
  reference                text UNIQUE NOT NULL   -- 'SLR-4F7Q'
  full_name                text NOT NULL
  phone                    text NOT NULL           -- '+2547XXXXXXXX'
  alt_phone                text
  email                    text
  area                     text NOT NULL           -- estate / town
  county                   text                   -- 'Kakamega' | 'Bungoma' (advisory)
  landmark                 text                   -- directions
  plan_id                  text NOT NULL REFERENCES plans(id)
  plan_name_snapshot       text NOT NULL   -- frozen at submission
  speed_mbps_snapshot      integer NOT NULL
  price_snapshot           integer NOT NULL  -- frozen monthly price (KES)
  installation_fee_accepted integer NOT NULL default 0
  installation_fee_amount  integer          -- frozen fee at submission (KES)
  terms_accepted           integer NOT NULL default 0
  preferred_contact_time   text                   -- 'morning'|'afternoon'|'evening'|'any'
  preferred_install_date   text
  referrer_phone           text                   -- phone of the person who referred them
  referral_code            text
  notes                    text
  source                   text NOT NULL default 'web'  -- 'web'|'whatsapp'|'referral'
  status                   text NOT NULL default 'new'
  payment_status           text NOT NULL default 'pending' -- pending|accepted|paid|refunded
  whatsapp_sent            integer NOT NULL default 0
  whatsapp_sent_at         text
  admin_notes              text
  customer_id              text REFERENCES customers(id)
  created_at               text NOT NULL
  updated_at               text NOT NULL

referral_awards
  id                   text PK
  referrer_phone       text UNIQUE NOT NULL   -- claimed referrer
  referrer_name        text
  customer_id          text REFERENCES customers(id)
  successful_referrals integer NOT NULL default 0
  days_granted         integer NOT NULL default 0
  status               text NOT NULL default 'pending'  -- pending|granted
  granted_at           text
  notes                text
  created_at           text NOT NULL
  updated_at           text NOT NULL

customers
  id             text PK
  full_name      text NOT NULL
  phone          text UNIQUE NOT NULL
  alt_phone      text
  email          text
  area           text
  landmark       text
  plan_id        text REFERENCES plans(id)
  account_number text UNIQUE                -- 'SL-0001'
  install_date   text
  monthly_price  integer
  status         text NOT NULL default 'active'   -- active|suspended|churned|pending
  notes          text
  created_at     text NOT NULL
  updated_at     text NOT NULL

complaints
  id             text PK
  reference      text UNIQUE NOT NULL            -- 'CMP-8H2D'
  customer_id    text REFERENCES customers(id)
  request_id     text REFERENCES requests(id)
  full_name      text NOT NULL
  phone          text NOT NULL
  category       text NOT NULL                   -- no_connection|slow|billing|hardware|moving|other
  subject        text NOT NULL
  description    text NOT NULL
  preferred_contact_time text
  status         text NOT NULL default 'open'    -- open|in_progress|resolved|closed
  priority       text NOT NULL default 'normal'  -- low|normal|high
  resolution     text
  resolved_at    text
  created_at     text NOT NULL
  updated_at     text NOT NULL

messages
  id             text PK
  customer_id    text REFERENCES customers(id)
  request_id     text REFERENCES requests(id)
  complaint_id   text REFERENCES complaints(id)
  direction      text NOT NULL                  -- outbound|inbound
  channel        text NOT NULL default 'whatsapp' -- whatsapp|manual|phone
  body           text NOT NULL
  template_key   text
  to_phone       text NOT NULL
  admin_id       text REFERENCES admins(id)
  created_at     text NOT NULL

settings                 -- single-row key/value config
  key   text PK
  value text NOT NULL

audit_log
  id         text PK
  admin_id   text REFERENCES admins(id)
  action     text NOT NULL      -- 'request.status', 'admin.login', ...
  entity     text
  entity_id  text
  detail     text
  ip         text
  created_at text NOT NULL
```

**Seed data:** 4 named plans (Starter 5/1000, Home 10/1500, Family 15/2000, Pro 20/3700 with `price_override`) + 1 Custom plan (`is_custom=1`, `price_override=NULL`, price computed by the rule); pricing rule (`base_speed_mbps=5`, `base_price=1000`, `price_per_mbps=100`, `min=5`, `max=100`, `rounding=50`); settings (`installation_fee=2500`, `installation_fee_includes`, `first_month_free=true`, `whatsapp_number=+254743498210`, `phone_primary`, `phone_secondary=+254762667048`, `support_hours='24/7'`, `mpesa_paybill`, `hero_*`, `footer_*`, `t_and_c`); content blocks (6 features, 4 steps, 7 FAQ entries, coverage areas, 4 testimonials); and the Owner admin account.

---

## 7. API Surface

All under `/api`. Responses are JSON `{ ok, data | error }`. Errors use `error: { code, message, fieldErrors? }`.

### 7.1 Public

| Method | Route | Body / Query | Purpose |
| --- | --- | --- | --- |
| GET | `/api/plans` | — | Active plans (cached, used by landing + form) |
| POST | `/api/requests` | request payload | Create request → `{ id, reference, whatsappUrl }` |
| POST | `/api/complaints` | complaint payload | Create complaint → `{ id, reference, whatsappUrl }` |
| GET | `/api/status/[reference]` | `reference` + `phoneLast4` | Public status lookup |
| POST | `/api/feedback` | `{ email, message }` | (v2) Formspree-style fallback |

### 7.2 Auth

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` → sets session cookie |
| POST | `/api/auth/logout` | Clears session |
| GET | `/api/auth/me` | Current admin + role |

### 7.3 Admin (all require session; role checked server-side)

> **Implementation note (v1.1):** admin **writes** (status changes, notes, plans, settings, content blocks, user management) are implemented as Next.js **Server Actions** in `src/app/admin/actions.ts` rather than JSON API routes — same validation, same audit logging, less boilerplate, and progressive enhancement (forms work without JS). Admin **reads** that need a JSON response (e.g. preparing a WhatsApp message) stay as route handlers under `/api/admin/*`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/admin/stats` | Dashboard KPIs |
| GET | `/api/admin/requests` | List + filters (`status`, `plan`, `area`, `q`, `from`, `to`, `page`) |
| GET/PATCH | `/api/admin/requests/[id]` | Detail / update status, notes, payment status |
| POST | `/api/admin/requests/[id]/convert` | Convert to customer |
| GET | `/api/admin/customers` | List + filters |
| GET/PATCH | `/api/admin/customers/[id]` | Detail / plan change, suspend, reactivate |
| GET | `/api/admin/complaints` | List + filters (`status`, `category`) |
| GET/PATCH | `/api/admin/complaints/[id]` | Detail / status, resolution, notes |
| GET | `/api/admin/messages` | Message log |
| POST | `/api/admin/messages` | Log an outbound/inbound message |
| GET/POST/PATCH | `/api/admin/plans` | Plan CRUD (soft-delete) |
| GET/PATCH | `/api/admin/pricing` | Pricing rule read/update + preview calculator |
| GET | `/api/admin/site` | All site settings + content blocks (one payload for the Content Manager) |
| PATCH | `/api/admin/site/settings` | Bulk-update settings keys (validated per key) |
| POST/PATCH/DELETE | `/api/admin/site/blocks` | Content block CRUD (features, steps, FAQ, coverage, testimonials) |
| GET | `/api/admin/settings` | Settings read (alias of `/api/admin/site`) |
| GET/POST/PATCH/DELETE | `/api/admin/users` | Admin user management (Owner only) |
| GET | `/api/admin/audit` | Audit log |

**HTTP status conventions:** 400 validation · 401 unauthenticated · 403 role violation · 404 not found · 409 duplicate (phone already a customer) · 429 rate limited.

---

## 8. WhatsApp Integration (v1 — `wa.me` deep links)

No Meta account, no API keys, no cost, works instantly. Limitation: the visitor/operator must still press "Send" in the WhatsApp app, and there is no automatic delivery receipt. v1 compensates by logging intent.

### 8.1 Target numbers

| Purpose | Number | wa.me target |
| --- | --- | --- |
| Requests, complaints, support (sink) | 0743498210 | `254743498210` |
| Secondary / call-only | 0762667048 | `254762667048` |

All numbers are stored in `settings` and read at send time — never hardcoded.

### 8.2 Request message template (exact)

```
*NEW INSTALLATION REQUEST*
Ref: SLR-4F7Q

*Name:* Brian Otieno
*Phone:* +254712345678
*Alt phone:* +254700000000
*Email:* brian@example.com

*Plan:* Home — 10 Mbps (Ksh 1,500/month)
*Area:* Kisumu Nyalenda
*Landmark:* Next to Amani Centre
*Preferred install date:* 2026-11-02
*Preferred contact time:* Afternoon

*Installation fee:* Ksh 2,500 — ACCEPTED ✅
*First month:* FREE
*Terms & Conditions:* ACCEPTED ✅

*Notes:* Two-storey house, need extra cable

_Sent from spiderlink.co.ke_
```

For a custom plan the plan line reads e.g. `*Plan:* Custom — 25 Mbps (Ksh 3,000/month)`.

Bold via WhatsApp asterisk wrapping; emoji used sparingly. Any optional field that is empty is omitted entirely (never "N/A" clutter).

### 8.3 Complaint message template

```
*NEW COMPLAINT*
Ref: CMP-8H2D

*Name:* Alice Wanjiru
*Phone:* +254733333333
*Category:* No connection
*Subject:* Fibre down since yesterday

*Description:* The link has been down since 6am. Lights on the ONT are red.

_Sent from spiderlink.co.ke_
```

### 8.4 Admin → user message templates (presets)

| Key | Template |
| --- | --- |
| `install_schedule` | Hi {{name}}, thanks for choosing Spider Link (ref {{reference}}). Your {{plan}} installation is scheduled for {{date}}. Installation fee Ksh 2,500. Reply 1 to confirm. |
| `survey_booking` | Hi {{name}}, we need a quick site survey for your {{plan}} connection. What date/time works for you? |
| `payment_reminder` | Hi {{name}}, a friendly reminder that the Ksh {{amount}} installation fee for {{plan}} is still pending. You can pay via M-Pesa to PayBill *000000* Spider Link. |
| `welcome` | Welcome to Spider Link Solution, {{name}}! Your {{plan}} ({{speed}} Mbps, Ksh {{price}}/month) is active. First month is on us. Any issues, just message this number. |
| `renewal` | Hi {{name}}, your {{plan}} subscription (Ksh {{price}}/month) renews on {{date}}. Thank you for staying with Spider Link. |
| `suspension` | Hi {{name}}, your {{plan}} service has been paused as requested. Message us any time to reactivate. |
| `complaint_update` | Hi {{name}}, regarding your complaint ({{reference}}), here's the update: {{message}} |

### 8.5 Send flow

1. Server builds the message body (template + data) and the URL `https://wa.me/<number>?text=<encodeURIComponent(body)>`.
2. Client opens it via `window.open(url, '_blank')` (popup-blocker safe: pre-open a blank window on click, then set `location`).
3. Server records the outbound message row (`direction='outbound'`, `channel='whatsapp'`) and flips `requests.whatsapp_sent = 1`.

If the popup is blocked, fall back to a visible anchor with `target="_blank"` and an on-page copy of the message text.

---

## 9. Admin UX Spec

- **Shell**: left sidebar (Dashboard, Requests, Customers, Complaints, Messages, Plans, Settings, Users) + top bar (search, admin profile, logout). Sidebar collapses to a bottom nav on mobile.
- **Tables**: server-paginated, sortable headers, sticky header row, row hover, status pills in brand colors, empty states with guidance.
- **Detail drawers**: right-side slide-over with tabs (Details / Timeline / Notes / Messages).
- **Feedback**: toast notifications for every mutation; optimistic status changes; skeleton loaders; inline error banners.
- **Theme**: light only in v1 (admin), landing uses light + dark hero band.
- **Mobile**: the admin is primarily used on a phone (operator is in the field) → tables collapse to cards under 768px, primary actions become large tap targets.

---

## 10. Technical Architecture

```
Browser (landing)                     Browser (admin)
      │                                       │
      ▼                                       ▼
   Vercel Edge/CDN  ◄── Next.js 15 App Router (React 19, TS, Tailwind)
                          │
        ┌─────────────────┼──────────────────────┐
        ▼                 ▼                      ▼
  Route Handlers    Server Components      Server Actions
  /api/*            (RSC data fetch)       (form submit)
        └─────────────────┬──────────────────────┘
                          ▼
                   Drizzle ORM (libsql)
                          ▼
              Turso/libSQL (cloud, HTTP)  ·  local dev: file:./local.db
```

- **Rendering**: landing = static/ISR (revalidate on plan/settings change), admin = dynamic (`force-dynamic`, no caching).
- **3D**: `three` + `@react-three/fiber` + `@react-three/drei` — client-only component, `dynamic(..., { ssr:false })`.
- **Validation**: `zod` schemas shared between client and API routes.
- **Session**: `jose` HS256 JWT in an httpOnly cookie; secret from `SESSION_SECRET` env.
- **Password hashing**: `@node-rs/argon2` (native, fast) with a `bcrypt` fallback.
- **Rate limiting**: in-memory token bucket (serverless caveat documented) + Turnstile for the public form if spam appears.
- **Turso client**: `@libsql/client` over HTTP in production; local file URL for development. Use `drizzle-orm/libsql` with the `drizzle-kit` migrations folder.

### 10.1 Environment variables

```
# Turso
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<token>

# Session
SESSION_SECRET=<32+ random chars>

# Seed owner admin (used by npm run db:seed)
SEED_ADMIN_EMAIL=owner@spiderlink.co.ke
SEED_ADMIN_PASSWORD=<strong password>

# Public
NEXT_PUBLIC_SITE_URL=https://spiderlink.co.ke
NEXT_PUBLIC_WHATSAPP_NUMBER=254743498210
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<optional>
TURNSTILE_SECRET_KEY=<optional>
```

---

## 11. Landing Page & 3D Specification

### 11.1 Hero

- Full-viewport hero (min 88vh), dark-to-red radial gradient mesh background, subtle noise/grain overlay.
- Center-stage 3D canvas; text overlay left-aligned on desktop, stacked on mobile.

### 11.2 The 3D scene ("Signal Spider")

Pure procedural geometry — **no 3D asset download required**:

| Element | Build | Animation |
| --- | --- | --- |
| Spider emblem | Angular spider silhouette constructed from primitives: a faceted abdomen (`Icosahedron`/custom `ExtrudeGeometry` from the SVG path), cephalothorax, 8 legs as tapered `TubeGeometry` along `CatmullRomCurve3` | Slow idle rotation (0.1 rad/s), legs subtly flex with a sine wave, whole emblem bobs ±0.08 units |
| Wi-Fi arcs | 3 torus-arc segments above the abdomen, `meshStandardMaterial` with emissive red + `emissiveIntensity` pulse | Pulsing outward, staggered 0.35s, intensity 0.6 → 2.0, infinitely looping |
| Signal particles | ~120 `Points` in a cylindrical volume around the emblem | Drift upward with slight swirl, respawn at bottom, opacity fades at the top |
| Backdrop | Wireframe icosahedron (radius 4.5, `wireframe`, opacity 0.08) + subtle grid floor with radial fade | Slow counter-rotation |
| Lights | `ambientLight` 0.6, `directionalLight` (2, 3, 4) intensity 1.2, `pointLight` red at (−2, 1, 2) intensity 8 with distance falloff | Point light orbits slowly |
| Camera | PerspectiveCamera fov 45, position [0, 0.4, 7] | Mouse parallax: camera lerps toward pointer (±0.35 units), damped |

**Interactions:** pointer parallax, click-to-pulse the arcs, and a "scroll to explore" hint. `prefers-reduced-motion` → static render of the emblem with a soft glow, no continuous loop.

### 11.3 Performance budget & fallbacks

| Rule | Value |
| --- | --- |
| Canvas mount condition | `window.innerWidth ≥ 768` **and** `!prefers-reduced-motion` **and** WebGL available |
| `dpr` | `[1, 1.5]` |
| Pause when | tab hidden (`visibilitychange`) or canvas out of viewport (`IntersectionObserver`) |
| Bundle | `three` + fiber + drei lazily loaded, chunk < 250 KB gzip target |
| Fallback | CSS/SVG animated emblem (pulsing arcs + rotation) if WebGL is unavailable or the device reports ≤ 4 cores / low memory |
| LCP target | < 2.5s on mobile 4G — hero text is HTML, not WebGL |

### 11.4 Motion language (whole page)

- Section reveals: fade + 24px translate-up, 0.5s, `cubic-bezier(0.16, 1, 0.3, 1)`, staggered 60ms per child, triggered by `IntersectionObserver` (once).
- Plan cards: 3D tilt on hover (max 6°, perspective 800px) + red glow shadow; on touch devices → press-state scale 0.98.
- Buttons: red fill, scale 1 → 0.97 on press, 200ms.
- Numbers (speeds/prices) count up once when scrolled into view.
- Everything respects `prefers-reduced-motion: reduce` (no transforms, no loops).

### 11.5 Design system

- **Type**: display face for headings (e.g. Archivo / Sora / Anton for the big italic "UNLIMITED FIBER" treatment as on the banner), Inter for body. Fallback stack `system-ui`. Headline treatment mirrors the banner: italic, heavy, red with a black outline/offset shadow and a white-to-red gradient panel behind it.
- **Type scale**: clamp()-based — h1 `clamp(2.5rem, 7vw, 5.5rem)`.
- **Spacing**: 4px base, 8-point scale (Tailwind default).
- **Radii**: 12px cards, 999px pills, 16px panels.
- **Shadows**: soft, red-tinted `0 20px 40px -20px rgba(230,0,0,0.35)`.
- **Grid**: max-width 1200px container, 12-col, 20–24px gutters.
- **Icons**: Lucide (tree-shakeable) + custom red check/feature icons matching the banner.
- **Logo usage**: the wordmark is always shown in full color on light; on dark backgrounds use the white/red inverse. Minimum clear space = height of the "S" in SPIDER.

### 11.6 Brand assets & the spider mark

Deliverables: `public/brand/logo-mark.svg` (transparent vector), `public/brand/logo-full.svg`, `public/brand/logo-mark.png` (512²), `public/brand/logo-full.png`, `public/brand/banner.jpg`, `public/brand/og.png` (1200×630).

**Action required from the client:** supply the original logo PNG (ideally transparent, or the source SVG/AI file) and the banner image so they can be placed in `public/brand/` and cropped/cleaned. Until then, a hand-built SVG recreation of the spider-with-wifi-arcs mark (`public/brand/spider-mark.svg`) is used as the placeholder and is directly usable in the 3D scene via `ExtrudeGeometry`.

---

## 12. Non-Functional Requirements

### 12.1 Performance
- Lighthouse Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 95 (mobile, landing).
- LCP < 2.5s (4G), CLS < 0.1, INP < 200ms.
- Admin pages first contentful paint < 1.5s (cached shells, server-rendered tables).

### 12.2 Accessibility (WCAG 2.1 AA)
- Brand red on white fails AA for small text → body links/accents use `#B30000`; large display text may use `#E60000`.
- Every form field has a visible label (not placeholder-only), `aria-describedby` for errors, `aria-invalid`, and a live-region error summary.
- Full keyboard operability; visible focus rings (2px red + 2px white offset).
- Color contrast ≥ 4.5:1 for all body text; plan prices are never conveyed by color alone.
- `prefers-reduced-motion` honoured site-wide.
- Headings in order, landmarks (`header`, `nav`, `main`, `footer`), `skip-to-content` link.

### 12.3 SEO
- Metadata API per route: title, description, canonical, OG + Twitter cards, `og:image` = `public/brand/og.png`.
- JSON-LD: `InternetServiceProvider` / `LocalBusiness` with `areaServed`, `priceRange`, `telephone`, `sameAs` (WhatsApp link).
- `sitemap.xml` + `robots.txt` generated by Next metadata routes; `noindex` on `/admin`, `/api/*`, `/request`, `/complaint`, `/status/*`.
- Semantic HTML, descriptive `<img alt>`, `lang="en"`.

### 12.4 Security
| Control | Implementation |
| --- | --- |
| Input validation | zod on every route; strip unknown keys; length caps |
| SQL injection | Drizzle parameterised queries only; no raw SQL interpolation |
| XSS | React escaping; no `dangerouslySetInnerHTML` except for a sanitised T&C rich-text block |
| Auth | httpOnly + secure + sameSite cookies; argon2id hashing; session revoked on deactivate; 7-day expiry; rotate secret on deploy |
| CSRF | SameSite=Lax cookies + `Origin`/`Referer` check on all mutating routes |
| Brute force | Login rate limit 5/15min; lockout + audit log |
| Spam | Honeypot + min-fill-time + optional Turnstile + submission cap |
| Headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off), `Strict-Transport-Security` on Vercel |
| Secrets | Only in Vercel env vars; never `NEXT_PUBLIC_*` |
| Errors | Generic user-facing messages; server errors logged, details never leaked to the client |
| Backups | Turso point-in-time recovery + weekly export dump to the admin's own storage (v2) |

### 12.5 Reliability & observability
- Vercel deployment previews for every push; production deploys from `main`.
- Structured logs (`console.info` JSON) with `requestId` on every API request; Vercel Analytics + Web Vitals.
- `/api/health` → `{ ok, db: 'up'|'down', version }` for uptime checks.
- Graceful DB-down state in the admin (banner + retry) instead of a crash.

### 12.6 Browser support
- Chrome/Edge/Firefox/Safari current + previous major; iOS Safari 16+; Android Chrome 120+.
- Baseline: no WebGL → static emblem fallback (page fully usable).

---

## 13. Delivery Plan

| Phase | Scope | Acceptance criteria | Est. |
| --- | --- | --- | --- |
| **P0 — Scaffold** | Next.js 15 + TS + Tailwind, Turso dev DB, Drizzle schema + migrations, seed, lint/typecheck/CI, brand tokens | `npm run dev` boots; `db:push` + `db:seed` work; CI green | 0.5 day |
| **P1 — Landing** | Tokens, typography, header/footer, Hero 3D scene, features, plans (incl. Custom calculator), how-it-works, FAQ, coverage, technicians, referral callout, install-fee band, contact, animations, a11y pass | Lighthouse ≥ 85 perf / ≥ 95 a11y; 3D runs at 60fps desktop, static fallback on reduced-motion | 2 days |
| **P2 — Request flow** | `/request` form (all fields + custom speed + live price), zod validation, Turso write, WhatsApp builder + templates, success panel, honeypot/rate-limit, public status lookup | Submitting creates a DB row (with frozen price) and opens a correctly formatted WhatsApp message to 0743498210; verified on a real phone | 1.5 days |
| **P3 — Admin core** | Login, session, middleware, admin shell, dashboard KPIs, requests table/filters/drawer, status workflow, notes, audit log | Owner can log in, see every request, change status; all changes audited | 2 days |
| **P4 — Customers, messaging, complaints** | Customer list/detail, message composer + templates + log, public complaint form, complaint queue/workflow, SLA badge, referral tracking + grant | Admin can message a customer in one click and resolve a complaint end-to-end | 2 days |
| **P5 — Content Manager** | Site tabs: plans, pricing rule, fees/offers, hero/header, features, steps, FAQ, coverage & crew, referral programme, testimonials, payments (PayBill), contact, legal/consent, branding; live preview | Changing a price, fee, PayBill number or headline updates the public site without a redeploy | 1.5 days |
| **P6 — Hardening + launch** | Security headers, rate limits, SEO (JSON-LD, sitemap, OG), error states, mobile QA on real Android, Vercel prod deploy | Production URL live; test request lands in WhatsApp + DB; admin works on a real phone | 1 day |

**Total: ~10.5 working days.** Client dependency: logo/banner assets (P1), M-Pesa PayBill number (P5), admin emails (P3), content sign-off (P1/P5).


---

## 14. Deferred to v2 (with design hooks already in place)

1. **M-Pesa STK push (Safaricom Daraja)** — schema already has `payment_status` (`pending → accepted → paid`) and `installation_fee_accepted`; the payment module will be an isolated service behind a `PaymentProvider` interface so adding STK push requires no data migration.
2. **WhatsApp Cloud API** — all WhatsApp sending goes through a `WhatsAppSender` interface (`sendWhatsApp({ to, body }) → { ok, externalId }`); v1 implements it as "build URL + log", v2 implements it as a Meta API call with delivery receipts.
3. **Automated replies / bots** (status updates, payment reminders, renewal nudges) via Cloud API + scheduled jobs (Vercel Cron).
4. **Customer portal** — login by phone + OTP, view plan, invoices, raise tickets.
5. **Coverage map** with per-area availability and online application.
6. **Coupons / automated referral credit** — v1 tracks referrals and grants reward days manually (§2.6); automatic invoice credit needs a billing engine.
7. **SMS fallback** via [iSpLedger](https://sms.ispledger.com/) for areas with poor WhatsApp connectivity (provider identified, not built).
8. **Bi-lingual (EN/SW) content** via a content dictionary (copy already centralised in `content/` config files).
9. **Installer field app** — install checklist, router serial numbers, photo evidence.

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Visitor never presses "Send" in WhatsApp | Lost lead despite form submission | Request is already in the admin panel; dashboard flags "WhatsApp not sent" as a call-out list; admin re-sends in one click |
| wa.me URL opened but message not sent | False positive | Dashboard shows `whatsapp_sent` as *intent*, not delivery; follow-up call for high-value/aged requests |
| No delivery/read receipts | Can't measure conversion | Track admin-side status progression (survey_scheduled → activated) as the true funnel metric |
| Free-tier Turso/Vercel limits on scale | Limits at very high traffic | Turso free tier is ample for this volume; upgrade path is one env var change |
| Admin account compromised | Data breach | Argon2 + rate limit + lockout + audit log + 2FA-ready structure; deactivation revokes sessions instantly |
| 3D scene hurts performance on low-end phones | High bounce rate | Mobile-first detection, reduced-motion and WebGL fallbacks, HTML hero for LCP, dpr cap |
| Copy/legal claims overreach | Consumer disputes | T&C acceptance checkbox, "activation subject to survey" note, legal review of the T&C text before launch |
| Vercel + Turso region latency (KE) | Slower admin queries | Turso has global PoPs; queries are tiny/indexed; measure and replicate to a nearer region if needed |
| Duplicate submissions | Double installs | Phone uniqueness check on conversion; duplicate-detection warning in the admin requests list |

---

## 16. Open Questions (need client answers before P2 finishes)

**Answered (v1.1):**

| Question | Answer | Effect on build |
| --- | --- | --- |
| Minimum contract period? | **No fixed term** | T&C copy says "no hidden charges, no fixed minimum" — editable in Content Manager (CM-P12) |
| Enforce coverage on the form? | **Advisory only** | Coverage is a friendly list + "we confirm with a quick site survey"; the form never blocks a lead |
| How is the Ksh 2,500 installation fee paid? | **M-Pesa PayBill** (number to be supplied) | PayBill + instructions live in Content Manager (CM-P10) and feed the payment-reminder template |
| Domain? | **Deferred** — launch on the Vercel URL | WhatsApp footers and OG tags read `NEXT_PUBLIC_SITE_URL` from env, so a domain change is one variable |
| Admin model? | **Multiple admins in DB** | `admins` table with roles; owner + agents (§3) |
| Service area? | **Kakamega (home base) + Bungoma county** | Both counties + exact location captured on the form; coverage stays advisory and never blocks a lead; list editable in CM-P16 |
| Installation crew? | **Alfred Nyongesa, Samuel Ogachi, Isaac Amutambi** | Seeded as `technician` content blocks; animated crew section on the landing page; phones in §2.6 |
| Referral reward? | **10 activated referrals → 60 extra days free** | `referrer_phone` on requests, progress + grant page at `/admin/referrals`; target/reward editable (CM-P17) |
| SMS notifications? | **Future** — provider identified as iSpLedger | Not built in v1; credentials and integration noted in `docs/API.md` and §14 |

**Still open:**

1. **20 Mbps price** — is Ksh 3,700 correct, or should it be Ksh 2,500 to follow the +500-per-5Mbps ladder? (seeded as 3,700 with an override; one field edit to change)
2. **M-Pesa PayBill number** and account-name format (blocks CM-P10 content).
3. **Estate/street list** — which estates and streets to feature under Kakamega and Bungoma in the coverage section (current seed entries are indicative).
4. **Router ownership** — leased or sold? Does the Ksh 2,500 fee cover the router permanently? (affects the welcome/payment copy)
5. **First month free** — does it apply to every plan, and does it start at activation or at the first billing cycle? (banner says "First Month FREE"; confirm scope)
6. **Admin users** — who besides the owner needs a login, and which role (owner/agent)?
7. **Brand assets** — the original logo file (PNG/SVG/AI) and banner image for `public/brand/`.
8. **Analytics** — Google Analytics / Meta Pixel for ad tracking? (affects consent wording)
9. **Complaint escalation number** — complaints to 0743498210 only, or also to 0762667048?
10. **Response SLA** — target response time for complaints (default 24h in this PRD).

---

## 17. Appendix — Brand asset requirements

| Asset | Spec | Status |
| --- | --- | --- |
| `logo-mark.svg` | Vector spider + wifi arcs, red `#E60000`, transparent, square | **Placeholder shipped** (`spider-mark.svg`) — needs client source file |
| `logo-full.svg` | Wordmark "SPIDER LINK / SOLUTION" horizontal lockup | To generate from client file |
| `logo-mark.png` | 512×512 transparent | **Placeholder** |
| `logo-full.png` | 1200×300 transparent | **Placeholder** |
| `banner.jpg` | Flyer, 850×1275 | **Placeholder** — supplied image to be added |
| `og.png` | 1200×630 social share card | To generate from logo + headline |
| `favicon.ico` / `icon.svg` | Browser icon | Derived from logo mark |

---

## 18. Tone & feel (design north star)

> The site should feel like a friendly neighbour with fast fibre, not a telecom conglomerate.

- **Warm, not corporate.** Red is the brand's energy, but the page reads like an invitation, not a contract. Soft corners, generous whitespace, human photography tone in copy.
- **One clear next step per screen.** The visitor always knows the single action: *Choose a plan → Request installation → Confirm on WhatsApp.*
- **Motion with purpose.** The hero animates to say "this is fast, modern, alive". Everything else moves once, gently, and only when it enters the viewport. No infinite decorative loops below the fold.
- **Honest about the survey.** Activation depends on a site survey, so the site never implies instant connection. Honest beats over-promising.
- **Plain language, Kenyan warmth.** "Your home", "we'll call you", "no hidden charges", "your first month is on us".
- **Fast on a phone.** The audience is on mobile data in Kenya. Lightweight 3D, no auto-playing video, no heavy libraries.

