# Kova — Claude Code Handoff Prompt

## Context Summary (read before starting)

You are building Kova, a couples budget dashboard app. The prototype `budget_dashboard.jsx`
in this folder is a fully working ~1300-line React component with 6 views: Overview,
Transactions, Calendar, Trends, Check-in, and Settings. It uses `window.storage` for
persistence and has no auth. Your job is to scaffold a real Next.js app around it,
swap the data layer, and add Clerk auth with multi-budget support via Organizations.

The UI design, color scheme, component logic, and all features must be preserved exactly.
Only the data layer changes. Do not redesign anything.

Key data model decision: a Budget is a Clerk Organization. All data is scoped to
`org_id`, not `user_id`. This enables shared budgets (couples, roommates) and multiple
budgets per user (joint + personal). Each user can belong to many orgs; each org can
have many members.

---

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Clerk (`@clerk/nextjs`) — auth + Organizations for shared budgets
- Railway Postgres — database
- Drizzle ORM (`drizzle-orm`, `drizzle-kit`) — type-safe query layer
- Recharts — charts (already used in prototype, keep exact same usage)

---

## Step 1 — Scaffold the project

Run the following to initialize the project in this directory:

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint
npm install @clerk/nextjs drizzle-orm drizzle-kit pg @types/pg recharts
```

---

## Step 2 — Database schema

Create `lib/db/schema.ts` with the following Drizzle schema.
All tables scope data to `org_id` (Clerk Organization ID).

```ts
import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  createdBy: text("created_by").notNull(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  budgetAmount: numeric("budget_amount").notNull(),
  dueDay: integer("due_day"),
  startingBalance: numeric("starting_balance"),
});

export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  createdBy: text("created_by").notNull(),
  date: text("date").notNull(),
  weekSpend: numeric("week_spend"),
  weekDebt: numeric("week_debt"),
  topCatName: text("top_cat_name"),
  topCatAmount: numeric("top_cat_amount"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull().unique(),
  checkinDay: integer("checkin_day").default(0),
  merchantMap: jsonb("merchant_map").default({}),
  monthlyNotes: jsonb("monthly_notes").default({}),
});
```

---

## Step 3 — API routes

Create the following Next.js API routes. Every route must:

1. Use `auth()` from `@clerk/nextjs/server` to get `userId` and `orgId`
2. Return 401 if either is missing
3. Scope all DB queries by `orgId`

Routes needed:

- `GET /api/transactions?month=YYYY-MM` — fetch transactions for a month
- `POST /api/transactions` — insert one or many transactions
- `DELETE /api/transactions/[id]` — delete by id, verify orgId ownership
- `PUT /api/transactions/[id]` — update by id, verify orgId ownership
- `GET /api/budgets` — fetch all budgets for the org
- `POST /api/budgets` — upsert budget by orgId + name
- `GET /api/checkins` — fetch all check-ins for the org
- `POST /api/checkins` — insert a check-in
- `DELETE /api/checkins/[id]` — delete by id
- `GET /api/settings` — fetch org settings
- `POST /api/settings` — upsert org settings
- `POST /api/seed` — seed a new org with default transactions and budgets (called on first org creation, protected by Clerk auth)

---

## Step 4 — Seed data

On first org creation, seed the org via `POST /api/seed` with:

- All 80 transactions from `SEED_TRANSACTIONS` in the prototype (April 2026 transactions)
- All budgets from `DEFAULT_BUDGETS` in the prototype
- Default settings: `checkin_day: 0`, empty `merchant_map`, empty `monthly_notes`

Trigger `POST /api/seed` automatically from the onboarding flow when a new org is created.

---

## Step 5 — Clerk auth setup

### Middleware

Create `middleware.ts` at the root:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Clerk config

Enable Organizations in the Clerk dashboard. The app needs:

- `allowedMemberships` to support multiple members per org
- Invitation flow enabled (Clerk handles this natively)

### Sign-in/sign-up pages

Create `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`
using Clerk's `<SignIn />` and `<SignUp />` hosted components. Keep styling minimal.

---

## Step 6 — Onboarding flow

After a user signs in for the first time (no org membership), show an onboarding screen
at `/onboarding` with two options:

**Option A — Create a new budget**

- Input: Budget name (e.g. "Kaia & Rich Joint")
- Creates a new Clerk Organization with that name
- Calls `POST /api/seed` to populate with default data
- Redirects to `/`

**Option B — Join an existing budget**

- Input: Paste an invite link
- Clerk handles the org invitation acceptance natively
- On success, redirect to `/`

Detect whether the user needs onboarding by checking if `orgId` is null after sign-in.
Redirect to `/onboarding` if so. Redirect to `/` if they already belong to an org.

---

## Step 7 — Budget switcher in nav

Add a budget switcher dropdown to the left of the nav links. It should show:

- The active org name (e.g. "Kaia & Rich Joint")
- A dropdown listing all orgs the user belongs to
- A "New Budget" option at the bottom that starts the create flow
- An "Invite partner" option that opens Clerk's built-in org invitation modal

Use Clerk's `useOrganizationList` and `useOrganization` hooks to power this.
Switching orgs should update the active org context and refresh all data.

Keep the Kova gem SVG logo to the left of the switcher. The gem is defined as:

```tsx
<svg width="24" height="24" viewBox="0 0 48 48" fill="none">
  <polygon points="24,4 36,16 24,22 12,16" fill="#2563eb" opacity="0.9" />
  <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75" />
  <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85" />
  <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6" />
  <line
    x1="24"
    y1="4"
    x2="24"
    y2="22"
    stroke="#bfdbfe"
    strokeWidth="0.8"
    opacity="0.9"
  />
</svg>
```

---

## Step 8 — Rebuild UI from prototype

Take every view from `budget_dashboard.jsx` and rebuild it as proper Next.js
App Router components, replacing all `window.storage` calls with fetch calls
to the API routes above.

### Suggested component structure

```
app/
  (dashboard)/
    page.tsx                   → Overview
    transactions/page.tsx
    calendar/page.tsx
    trends/page.tsx
    checkin/page.tsx
    settings/page.tsx
    layout.tsx                 → shared dashboard layout with nav
  onboarding/page.tsx
  sign-in/[[...sign-in]]/page.tsx
  sign-up/[[...sign-up]]/page.tsx
  layout.tsx                   → ClerkProvider root layout
components/
  nav.tsx
  budget-switcher.tsx
  kova-gem.tsx                 → reusable gem SVG component
  checkin-modal.tsx
  charts/
    donut-chart.tsx
    bar-chart.tsx
    line-chart.tsx
lib/
  db/
    schema.ts
    index.ts                   → Drizzle client
```

### Preserve exactly from prototype

- All color tokens: `#2563eb` accent, `#f8fafc` bg, `#0f172a` text, `#64748b` muted, `#e2e8f0` border
- The Kova gem SVG logo (defined above)
- All 6 views and their full feature sets
- The Kova check-in modal with the AI summary stub (do NOT wire up the Claude API)
- Debt payoff progress bars on Overview
- Due soon strip on Overview
- Monthly notes textarea on Overview
- Balance trend line chart on Overview
- CSV import flow with duplicate detection and merchant memory (persist merchant_map in settings)
- Calendar with bill due dates plotted by due_day
- All Settings tabs: Budget Targets, Categories, Debt Balances, Check-in Day
- Inline edit row (pencil icon) in transaction log
- Batch manual entry form

---

## Step 9 — Environment variables

Create `.env.local`:

```
DATABASE_URL=                              # Railway Postgres connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=         # From Clerk dashboard
CLERK_SECRET_KEY=                          # From Clerk dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

---

## Step 10 — Git + deploy setup

1. Run `git init`
2. Create `.gitignore` (Next.js default + `.env.local`)
3. Create initial commit with message `init: scaffold Kova from prototype`
4. Create `README.md` with setup instructions (Railway, Clerk, migrations, deploy)

---

## Manual steps to print at the end

When the build is complete, print the following instructions clearly:

**1. Railway**

- Go to railway.app → New Project → Provision PostgreSQL
- Copy the connection string → paste into `.env.local` as `DATABASE_URL`

**2. Clerk**

- Go to clerk.com → Create application → enable Email + Google sign-in
- Go to Organizations → enable Organizations
- Copy Publishable Key and Secret Key → paste into `.env.local`

**3. Run migrations**

```bash
npx drizzle-kit push
```

**4. Vercel**

- Push repo to GitHub
- Import into Vercel
- Add all `.env.local` variables as environment variables in Vercel dashboard
- Deploy

**5. Custom domain**

- In Vercel: Settings → Domains → add `budget.kaiafay.com`
- In Cloudflare: add CNAME record pointing to Vercel deployment URL

---

## Context Management Instructions

Before starting any step, summarize what you have built so far and what remains.
If your context window approaches 60% capacity, stop and produce a concise summary
of: (1) files created, (2) decisions made, (3) remaining steps. Then continue from
that summary. Never drop or forget the hard constraints at the bottom of this prompt.

## Hard constraints

- Do not redesign any UI — colors, layout, components, and all features must match the prototype exactly
- Do not add features beyond what is described in this prompt
- Do not use Supabase — Railway + Drizzle only
- Do not use localStorage or any client-side persistence — all state goes through API routes
- All API routes must be protected by Clerk auth and scoped by `orgId`
- The Kova AI summary section in the check-in modal stays as a stub — do not wire up any AI API
- Keep `SEED_TRANSACTIONS` and `DEFAULT_BUDGETS` from the prototype as the seed data source
- All file operations must stay within the current working directory. Do not read, write, or modify any files outside this project folder.
