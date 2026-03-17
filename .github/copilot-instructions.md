# Copilot Instructions for Mov-O-Matic

## Quick context
- Mov-O-Matic is a full-stack TypeScript project: **client/** (React + Vite) + **server/** (Express + TypeScript). Shared types/schemas live in `shared/schema.ts` (Drizzle + zod).
- Core AI logic is centralized in `server/services/gemini.ts` (class `AITravelPlanner`). The server exposes AI endpoints under `/api/ai/*` and trip endpoints under `/api/trips*` (see `server/routes.ts`).

## What you must know to be productive
1. Architecture & responsibilities
   - `client/` — React + TypeScript (Vite). UI components and forms live in `client/src/components` (e.g. `trip-wizard-form.tsx` calls the trip-generation endpoint).
   - `server/` — Express app entry is `server/index.ts`. Routes defined in `server/routes.ts`. The server may run Vite in middleware mode during development (`server/vite.ts`).
   - `shared/schema.ts` — single source of truth for DB tables, Zod insert schemas, and types (AITripRequest, AIRecommendation). Use these types when touching API or AI code.
   - Storage abstraction: `server/storage.ts` implements a `MemStorage` that the routes use. Replace/extend this to plug in Drizzle/Postgres for persistent storage.

2. Development & build workflows (explicit commands)
   - Install: `npm install`
   - Dev (server + client in middleware): `npm run dev` (starts TypeScript server via `tsx` and Vite middleware)
   - Build (client + bundle server): `npm run build` (runs `vite build` then `esbuild`) and start production with `npm start`.
   - DB migrations: `npm run db:push` (uses `drizzle-kit`).
   - Firebase helpers: `npm run firebase:setup`, `npm run firebase:emulators` (see `.env.example` for VITE_FIREBASE_* keys).

3. Environment & secrets
   - Copy `.env.example` to `.env` and fill required values: `GEMINI_API_KEY`, `DATABASE_URL` (for Postgres), `SESSION_SECRET`, `VITE_FIREBASE_*` keys, and `PORT`.
   - GEMINI usage is required for AI endpoints — tests and debug scripts assume a valid key.

4. AI-specific constraints (critical, do not change lightly)
   - The AI prompt and output contract live in `server/services/gemini.ts`.
   - The Gemini prompt enforces: "RETURN ONLY VALID JSON" and **EXACTLY N day objects** in the `itinerary` array. This is critical for downstream parsing and UI expectations. Any modifications must preserve the JSON-only contract and the exact-days requirement.
   - The AI module uses `@google/generative-ai` and the model `models/gemini-2.5-flash`. Watch for API changes and error cases; the code already implements a validation step (`validateDestinationCompatibility`) that returns precise fields: `unavailableInterests`, `unavailableFoods`, `unavailableActivities`, `suggestions`.
   - When adding new AI features, add matching TypeScript types to `shared/schema.ts` and ensure tests or debug scripts include example payloads.

5. API patterns & examples
   - Trip generation: POST `/api/trips/generate` — body must contain `description` (see `server/routes.ts`). Example client call seen in `client/src/components/trip-wizard-form.tsx`.
   - Hotel recommendations: POST `/api/ai/hotel-recommendations` — example payload (from `test-api-endpoints.js`):
     ```json
     {"destination":"Mumbai","budget":5000,"travelStyle":"business","interests":["food","culture"],"amenities":["WiFi","Restaurant"],"travelers":2}
     ```
   - Hidden gems: POST `/api/ai/hidden-gems` — similar payloads; see `test-api-endpoints.js` and `debug-itinerary.mjs` for test patterns.

6. Conventions & patterns to follow
   - Use the types from `shared/schema.ts` for request/response shapes. Use `createInsertSchema` generated Zod schemas to validate incoming payloads like in `server/routes.ts`.
   - Logging: code uses `console.log`/`console.warn` heavily to surface AI/parsing issues. Preserve important logs during debugging to help QA.
   - Keep AI prompts deterministic: avoid adding ambiguous language that may cause the model to include human-readable commentary or stray text (which breaks JSON parsing logic in the app).
   - When replacing `MemStorage` with a persistent implementation, follow the `IStorage` interface defined in `server/storage.ts` and update imports in `server/index.ts` or dependency injection points.

7. Useful files to inspect when working on features
   - `server/services/gemini.ts` — AI logic, validation, prompts (must preserve JSON contract)
   - `server/routes.ts` — endpoint wiring and payload validation
   - `shared/schema.ts` — all DB and AI types
   - `server/storage.ts` — storage interface & in-memory implementation
   - `client/src/components/trip-wizard-form.tsx` — client-side generation flow
   - `test-api-endpoints.js`, `debug-itinerary.mjs` — example requests for manual testing
   - `.env.example` — required ENV vars

8. Quick testing tips
   - Start the app locally: `npm run dev` (ensure `.env` has `GEMINI_API_KEY` set for AI tests).
   - Run example tests: `node test-api-endpoints.js` (these are lightweight, manual test clients). If the server is not on port 5000, set `PORT` env accordingly.
   - Use the console logs generated by `AITravelPlanner` to debug prompt inputs and returned text before JSON parsing.

---
If any section is unclear, tell me which part you'd like expanded (for example: more examples of request payloads, how to plug Drizzle/Postgres into `storage`, or where front-end components consume AI output). I'd be happy to iterate. ✅