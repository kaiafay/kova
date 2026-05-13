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
- **Clerk browser sign-in may be blocked by device verification**: Clerk enforces email-based 2FA for new devices even in dev mode. To test API routes without browser auth, create a Clerk session via the Backend API and use the JWT as a Bearer token. See the workflow below.

### Testing API routes without browser sign-in

When browser-based Clerk sign-in is impractical (e.g., email verification is required but no inbox is available), use the Clerk Backend API to create authenticated sessions:

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

# 5. Call app API routes
curl -H "Authorization: Bearer <jwt>" http://localhost:3000/api/budgets
```
