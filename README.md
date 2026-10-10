# Devora frontend

React 19 + Vite + TypeScript + Tailwind 4 + React Router + TanStack Query. Frontend only. The Express/PostgreSQL backend is built separately and talks to this app through the contract in `docs/API_CONTRACT.md`.

## Run
```bash
npm install
cp .env.example .env     # VITE_USE_MOCK=true works with no backend
npm run dev              # http://localhost:5173
npm run build            # typecheck + production build
```
Demo accounts in mock mode: `student@devora.et` and `instructor@devora.et`, password `password123`.
In mock mode, the "Chapa" page is a fake screen (`/mock-chapa/:txRef`) where you choose the payment result.

## Connecting the real backend
1. In `.env` set `VITE_USE_MOCK=false` and `VITE_PROXY_TARGET=http://localhost:4000` (the Express server).
2. Serve the API under `/api` (or change `VITE_API_URL`).
3. Make each endpoint in `docs/API_CONTRACT.md` return the shapes in `src/api/types.ts`.
No UI code needs to change. Before deploying, remove `src/api/mock` and `src/seed-data.ts` if you want a smaller bundle.

## Structure
- `src/api/` types, HTTP client (token, errors), one file per resource, `mock/` fake server
- `src/hooks/` React Query hooks (`queries.ts`) and `useApp` (navigation + saved/enrolled helpers)
- `src/context/AuthContext.tsx` session (token in localStorage, `GET /auth/me` on load)
- `src/components`, `src/pages` screens. Routes are in `src/App.tsx`
