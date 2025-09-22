# dreams5-onboarding-agent

Minimal scaffold for the onboarding worker. Contains routes, a Durable Object orchestrator, and helpers for D1, R2 and KV.

Quick start

1. Install dependencies: `npm install`
2. Develop: `npm run dev` (requires Wrangler)
3. Build: `npm run build`

Files of interest

- `src/index.ts` — Worker entry
- `src/do/OnboardBrain.ts` — Durable Object orchestrator
- `src/routes/*` — route handlers
- `migrations/001_init.sql` — D1 schema

Endpoints (happy-path)

- `POST /api/welcome` — generate magic link and mark welcome sent
- `POST /webhooks/stripe` — receive Stripe event, mark payment, seed steps
- `GET /api/steps?tenant_id=...` — list steps for a tenant
- `POST /api/steps/:step_key` — append a step update row
- `POST /api/connect` — store encrypted credentials per service
- `POST /api/verify` — enqueue verification job (dns, ga4, pixel, gbp, hubspot)
- `GET /api/greenlight?tenant_id=...` — compute readiness score

Notes

- Sensitive payloads stored via `encryptJSON` with `SECRET_KEY`.
- Queue consumer processes verification jobs and appends step rows with statuses.
