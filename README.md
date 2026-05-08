# Kova

A shared budget dashboard for couples and small households: one place for spending, categories, and weekly check-ins instead of chasing spreadsheets and bank exports.

## Overview

Kova is a private web app. You sign in, create or join a household (each household is its own space), then track transactions, set category budgets, and optionally run a short weekly check-in to stay aligned on where money went.

It was built as a personal tool, not a packaged product. Deploy it yourself if you use it; there is no fixed production link in this repo.

## Why I Built This

Bank CSVs and spreadsheets rarely agree on categories or month boundaries. When two people maintain parallel files, reconciliation turns into a hobby. I wanted a single category model, sensible bank import, and shared data so the household sees the same numbers.

## Live demo

Coming soon.

## What you can do

**Money and budgets**  
Browse spending by month, assign transactions to fixed categories (income, bills, everyday spending, debt payments, subscriptions), and adjust category budgets as life changes.

**Getting data in**  
Add transactions by hand on any device. On desktop you can import CSV exports from common banks; the importer tries to recognize columns, warns about likely duplicates, and can remember merchant names for faster categorization next time.

**Rhythm**  
A configurable weekly check-in summarizes recent spending and can fold notes into monthly context. There is also a dedicated check-in history and calendar-style views for planning on larger screens.

**Households**  
Invite people through normal organization flows in the app. Everyone sharing a household sees the same budget; updates from someone else refresh automatically in the background.

**Devices**  
Overview and transactions work on phones and desktops. Some deeper screens (calendar, trends, full settings, full check-in flow) are optimized for wider layouts and show a simplified message on small screens.

## Tech stack

| Area              | Choices                                                      |
| ----------------- | ------------------------------------------------------------ |
| App               | Next.js (App Router), React, TypeScript                      |
| Styling           | Tailwind v4 plus focused inline styling for dashboard panels |
| Charts & dates    | Recharts, react-day-picker                                   |
| Auth & households | Clerk (sign-in, organizations, switching between budgets)    |
| Data              | PostgreSQL, Drizzle ORM                                      |
| Validation        | Zod on API inputs                                            |

Deployment-friendly: npm scripts for lint and build; migrations via Drizzle; optional `deploy:prod` script using the Vercel CLI.

## How it works

Only signed-in users reach the app. Each household’s data is stored separately. Amounts are handled carefully end to end so rounding and floating-point quirks do not corrupt balances.

The UI keeps itself reasonably fresh when another person edits something by periodically asking the server for a lightweight “fingerprint” of what changed, then reloading shared state when needed.

## Roadmap

- [ ] Automated tests on critical API and UI paths
- [ ] Richer experience on tablet and phone for screens that are desktop-first today
- [ ] Stronger accessibility pass on custom pickers and tables
- [ ] Monitoring and logging if the app outgrows a single-household setup

## Screenshots

Coming soon.
