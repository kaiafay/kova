# Kova – Agent Instructions

See `README.md` for project overview and `.cursor/rules/` for detailed code conventions.

## Cursor Cloud specific instructions

### Services

| Service | How to start | Notes |
|---|---|---|
| PostgreSQL | `sudo pg_ctlcluster <ver> main start` (check version with `pg_lsclusters`) | Local DB; user `kova`, password `kova`, database `kova`. `DATABASE_URL=postgresql://kova:kova@localhost:5432/kova` |
| Next.js dev server | `npm run dev` | Runs on port 3000. Requires valid Clerk keys in `.env.local` to serve authenticated pages. |

### Environment variables

The app needs a `.env.local` at the repo root with:

- `DATABASE_URL` – PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk publishable key
- `CLERK_SECRET_KEY` – Clerk secret key

These are injected as VM secrets. Without valid Clerk keys, the dev server starts but all routes return a "Publishable key not valid" error.

### Key commands

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Dev server | `npm run dev` |
| Generate migrations | `npm run db:generate` |
| Apply migrations | `npm run db:migrate` |

### Gotchas

- **No test framework** is configured. Verify changes via `npm run lint` and `npm run build`.
- **Pre-existing lint errors**: The repo has ~7 lint errors (react-hooks rules) and ~5 warnings. These are in the existing codebase; do not attempt to fix them unless that is the task.
- **Drizzle migrations folder**: The `drizzle/` directory may not exist on a fresh clone. Run `npm run db:generate` to create it, then `npm run db:migrate` to apply.
- **PostgreSQL must be running** before `npm run db:migrate` or `npm run dev` (if the app queries the DB at startup).
- **Clerk is required for runtime**: The app cannot serve any authenticated page without valid Clerk API keys. Lint and build work without them.
### Browser sign-in for UI testing (Clerk test mode)

Clerk test mode is enabled on the dev instance. To sign up and authenticate in the browser without a real email inbox:

1. Navigate to `http://localhost:3000/sign-up` (use an Incognito window for a clean session).
2. Enter a test email using the `+clerk_test` suffix, e.g. `agent+clerk_test@example.com`.
3. Enter any password and submit.
4. On the verification code screen, enter `424242`.
5. You'll land on the onboarding page — create a budget to reach the dashboard.

This flow is fully autonomous and does not require email access.

### Testing API routes without browser sign-in

When you need to test API routes directly (e.g. from curl or scripts), use the Clerk Backend API to create authenticated sessions:

```bash
# 1. Create a user (if needed)
curl -X POST "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_address":["test@example.com"],"password":"SomeUniquePass!","skip_password_checks":true}'

# 2. Create an organization for the user
curl -X POST "https://api.clerk.com/v1/organizations" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Budget","created_by":"<user_id>"}'

# 3. Create a session
curl -X POST "https://api.clerk.com/v1/sessions" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user_id>"}'

# 4. Get a JWT (valid ~60s, refresh as needed)
curl -X POST "https://api.clerk.com/v1/sessions/<session_id>/tokens" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY"

# 5. Seed default budgets for the org, then call app API routes
curl -X POST -H "Authorization: Bearer <jwt>" http://localhost:3000/api/seed
curl -H "Authorization: Bearer <jwt>" http://localhost:3000/api/budgets
```

Note: when creating orgs via the Backend API (not the app UI), `POST /api/seed` must be called manually to populate default budget categories. The app's onboarding page does this automatically.

## Known issues

- **Orphaned Clerk organizations**: When the last member leaves a budget (self-removal via `DELETE /api/members/[userId]`), the Clerk organization is not deleted — it becomes orphaned with zero members. The `deleteBudget` flow in `budget-switcher.tsx` does call `organization.destroy()`, but that's a separate manual action. A fix should check the remaining member count after self-removal and auto-delete the org (and its database rows) if empty.
