# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** pnpm only (enforced by preinstall hook — never use npm or yarn).

```bash
# Install all workspace dependencies
pnpm install

# Run the API server (dev, with tsx watch)
pnpm --filter @workspace/api-server run dev

# Run the frontend (dev, Vite)
pnpm --filter @workspace/fit-finder run dev

# Typecheck everything
pnpm run typecheck

# Build everything
pnpm run build

# Push DB schema changes (no migrations — direct push)
pnpm --filter @workspace/db run push

# Regenerate API client + Zod validators from openapi.yaml
pnpm --filter @workspace/api-spec run codegen
```

There are no automated tests yet.

**Known issue:** `pnpm run typecheck` fails on pre-existing errors in `lib/api-zod`, `lib/integrations-openai-ai-server`, and `lib/integrations-openai-ai-react`. These are unrelated to api-server work. Run `pnpm --filter @workspace/api-server run typecheck` to check api-server in isolation (requires `tsc --build` on libs to succeed first).

## Architecture

### Monorepo layout

```
artifacts/
  api-server/     Express 5 + TypeScript backend
  fit-finder/     React 19 + Vite + Tailwind frontend
lib/
  db/             Drizzle ORM schema + Postgres client
  api-spec/       openapi.yaml + Orval codegen config
  api-client-react/  Generated TanStack Query hooks (do not hand-edit)
  api-zod/        Generated Zod request/response validators (do not hand-edit)
  integrations-openai-ai-server/  OpenAI SDK wrapper (server-side)
  integrations-openai-ai-react/   OpenAI SDK helpers (client-side audio)
```

### Data / request flow

1. **Frontend** (`fit-finder`) calls the **API** via generated hooks from `lib/api-client-react`. All requests go to `/api/*`.
2. **API** (`api-server`) validates request bodies with generated Zod schemas from `lib/api-zod`, then hits either Postgres (via Drizzle) or OpenAI.
3. **OpenAI** is accessed through the Replit AI Integrations proxy (`lib/integrations-openai-ai-server`). Text: `gpt-5.2`. Images: `gpt-image-1-mini` at `1024x1536` medium quality. Image responses are returned as base64 inline (~2MB — known debt, R2 migration pending).
4. **DB schema** lives in `lib/db/src/schema/`. Schema changes are applied with `drizzle-kit push` (no migration files).

### API spec is the source of truth

`lib/api-spec/openapi.yaml` → Orval → generates both `lib/api-client-react` and `lib/api-zod`. After editing the spec, run codegen before touching generated files. **Known drift:** spec still references `profileId` as a query param in some places; actual server behaviour differs (see routes).

### Frontend routing

Wouter (not React Router). Routes defined in `artifacts/fit-finder/src/App.tsx`:
- `/` — Home (vibe prompt entry)
- `/looks` — LooksPage (swipable outfit cards + model image generation)
- `/profile` — ProfilePage
- `/saved` / `/saved/:id` — saved looks

State: TanStack Query for server state, `CartContext` for cart, no global store.

### Outfit generation pipeline (`POST /api/outfits/generate`)

`artifacts/api-server/src/routes/outfits.ts` contains the full pipeline:
1. Builds a system + user prompt from the vibe string, user profile, budget tier, and size preferences.
2. Calls `gpt-5.2` with `response_format: json_object` — returns 4 distinct looks, each with items across 8 categories (Top/Dress, Bottom, Shoes, Bag, Jewelry, Accessories, Makeup, Hair).
3. All brand/item recommendations are LLM-generated (not from a real catalog yet — catalog retrieval is the primary strategic moat to build).

### Model image generation (`POST /api/outfits/model-image`)

`buildImagePrompt()` in the same file assembles a detailed editorial-style prompt from the look's items, user skin tone, and size. Uses `gpt-image-1-mini` at `1024x1536`. Hotspot positions (for tappable item overlays) are computed server-side via a hardcoded `REGION_MAP` keyed by item category.

## Required environment variables

| Variable | Used by |
|---|---|
| `SESSION_SECRET` | HMAC signing of device cookies (`src/lib/auth.ts`) |
| `UPSTASH_REDIS_REST_URL` | Rate limiting — omit to disable (fail-open) |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting — omit to disable (fail-open) |
| `ALLOWED_ORIGINS` | CORS whitelist, comma-separated. Omit → reflect origin (dev only) |
| `DATABASE_URL` | Postgres connection |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Replit OpenAI proxy |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Replit OpenAI proxy |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |

## Security invariants

- `profileId` must always come from `req.deviceId` (signed cookie) — **never** from request params or body on auth-sensitive endpoints. The profile and outfits routes currently accept `profileId` from the body/query as interim behaviour; this must be locked down before launch.
- Rate limiting uses `req.deviceId` as the identifier.
- Never log `SESSION_SECRET`, Upstash tokens, or OpenAI keys (Pino request serialiser already strips query strings from logged URLs).
- `.env` / `.env.local` must never be committed.

## Known technical debt (prioritised)

1. Catalog retrieval pipeline — pgvector + retailer feeds (the moat)
2. S3/R2 image hosting — currently base64 inline (~2MB payloads)
3. Real auth — currently device-cookie only (`src/lib/auth.ts`)
4. OpenAPI spec drift — `profileId` query param references
5. Cost tracking table — `ai_generations` (deviceId, tokens, cost_cents)
6. Lazy model image rendering — render on right-swipe, not upfront (75% cost saving)
