E-Com Monorepo (pnpm workspace)
--------------------------------
Monorepo for an e-commerce platform. Uses pnpm workspaces to share code between a Node.js/Express backend, a shared package of Zod schemas/types, and a Vite/React user-facing frontend. An `admin-frontend` package exists as a placeholder and is currently empty.

Prerequisites
- Node.js (LTS recommended) and pnpm (tested with pnpm 10.x).
- MongoDB connection string for the backend.

Install
- From the repository root: `pnpm install`

Workspace scripts (run from repo root)
- `pnpm dev:backend-ts` — watch/compile backend TypeScript to `packages/backend/dist`.
- `pnpm dev:backend-node` — run backend from compiled `dist` with nodemon (start `dev:backend-ts` first or run `pnpm --filter backend build` once).
- `pnpm dev:user-front` — start the user-facing Vite dev server.
- `pnpm dev:shared` — watch/compile shared package.
- `pnpm fullstakck-clean` — clean `dist` folders across packages.

Packages
- `packages/backend` — Express 5 API with MongoDB/Mongoose, JWT auth, Zod validation, rate limiting, and Pino logging. Build with `pnpm --filter backend build`; test with `pnpm --filter backend test`.
- `packages/shared` — Zod schemas and typed exports shared by other packages. Build with `pnpm --filter @e-com/shared build`; test with `pnpm --filter @e-com/shared test`.
- `packages/user-frontend` — React 19 + Vite + Tailwind 4 UI that consumes shared types/schemas. Dev with `pnpm --filter user-frontend dev`, build with `pnpm --filter user-frontend build`.
- `packages/admin-frontend` — reserved for future admin UI; currently empty.

Backend environment
Create a `.env` in `packages/backend` with:
- `PORT` — server port
- `NODE_ENV` — `development` | `production` | `testing`
- `MONGODB_CONNECTION_STRING`
- `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY` (default `15m`)
- `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY` (default `7d`)
- `LOGIN_WINDOW_MS` (default `10000`), `LOGIN_MAX_ATTEMPTS` (default `5`)

Testing
- Vitest is wired for backend and shared: `pnpm --filter backend test`, `pnpm --filter @e-com/shared test`.

Status
- Core backend auth flows, shared schemas, and the user-facing UI scaffold are present. Admin UI is not yet implemented.
