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
