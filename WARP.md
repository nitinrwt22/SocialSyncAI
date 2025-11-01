# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Full-stack TypeScript app: React (Vite) client under client/, Express server under server/, and shared Zod schemas under shared/.
- Firebase Auth + Firestore for auth/data; Hugging Face Inference API for sentiment; React Query for data fetching; Tailwind + shadcn/ui.

Commands
- Install deps: npm install
- Dev (Express + Vite middleware, hot reload): npm run dev
- Typecheck: npm run check
- Build (client + server bundle): npm run build
- Start production server (serves dist/public): npm start
- Database migration (Drizzle): npm run db:push
  - Note: Requires DATABASE_URL and a Drizzle schema. This repo’s shared/schema.ts contains Zod types (not a Drizzle schema) and the app uses Firestore, so this is typically unused unless you add Postgres.

Environment
- Required variables for local dev (set before npm run dev/build/start):
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_APP_ID
  - VITE_FIREBASE_API_KEY
  - VITE_HUGGING_FACE_API_KEY
  - PORT (optional; defaults to 5050)
- Auth in development: server accepts x-user-id header as a fallback when NODE_ENV=development.

How to run and verify
- Start dev server: npm run dev → Visit http://localhost:5050
- Example API calls (development):
  - Analyze text: curl -X POST http://localhost:5050/api/analyze -H 'Content-Type: application/json' -d '{"text":"Great day!"}'
  - List posts for a user (dev fallback): curl http://localhost:5050/api/posts -H 'x-user-id: TEST_UID'

Testing and linting
- No tests or linter are configured in package.json. Use npm run check for type checks.

High-level architecture
- Build system (vite + esbuild):
  - Vite config at vite.config.ts with aliases: '@' → client/src, '@shared' → shared, '@assets' → attached_assets. Client build outputs to dist/public. The build script also bundles server/index.ts with esbuild to dist/index.js.
  - Dev: server/setup uses Vite in middleware mode (server/vite.ts) for HMR; Production: server serves dist/public as static assets.
- Shared contracts (shared/schema.ts):
  - Zod schemas/types for Post, AIAnalysis, Analytics, and UserProfile. Imported by both client and server for validation and typing.
- Server (server/):
  - index.ts: Express setup, JSON parsing, request logging, error handling, Vite dev integration (development) or static file serving (production).
  - routes.ts: REST API
    - POST /api/analyze → Hugging Face-based sentiment and hashtag generation (server/ai.ts).
    - GET /api/posts → Current user’s posts from Firestore.
    - POST /api/posts → Create post; validates request via insertPostSchema.
    - DELETE /api/posts/:id → Delete with ownership check.
    - GET /api/analytics → Aggregates analytics over user’s posts.
  - firestore.ts: Initializes firebase-admin (uses VITE_FIREBASE_PROJECT_ID). Export db (Firestore) and adminAuth.
  - ai.ts: HfInference client built from VITE_HUGGING_FACE_API_KEY; maps model labels to positive/neutral/negative; simple hashtag generation.
  - storage.ts: In-memory example storage not wired into routes.
- Client (client/):
  - index.html is the entry; src/main.tsx mounts App.
  - src/App.tsx configures providers: React Query, Theme, Auth; routes via wouter; guarded routes via ProtectedRoute.
  - src/contexts/AuthContext.tsx: Firebase Auth (email/password + Google). Persists a UserProfile document in Firestore on first login.
  - src/lib/queryClient.ts: React Query client with a default queryFn; attaches x-user-id header from Firebase auth for server dev fallback; API helper apiRequest for mutations.
  - src/pages/: dashboard, create-post, my-posts, analytics, settings, auth, not-found.
  - src/components/ui/: shadcn/radix-based UI primitives used across pages; Tailwind theme customized in tailwind.config.ts.

Conventions and notes
- Imports should use configured aliases ('@', '@shared', '@assets').
- In development, client requests include x-user-id when logged in; server also supports Firebase ID tokens via Authorization: Bearer <token>.
- The server logs brief summaries for /api/* requests (method, path, status, duration, and small JSON payload excerpt).

What’s missing / non-standard
- Tests and linting are not configured. If adding ESLint/Jest/Vitest, include scripts and update this file with run commands (including how to run a single test).
- Drizzle config exists but is not used by the app (Firestore is the active DB). Update or remove if migrating to Postgres.
