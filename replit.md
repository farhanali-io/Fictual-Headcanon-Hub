# Fictual

Fictual is a static creative-tool hub for writers, roleplayers, and original-character creators, launching with a local headcanon generator and shareable PNG cards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/fictual/src/App.tsx` — routed homepage, generator pages, local template bank, saved shelf, FAQ schema, and PNG export behavior.
- `artifacts/fictual/src/index.css` — shared Fictual theme, typography, texture, responsive styles, and motion utilities.
- `artifacts/fictual/.replit-artifact/artifact.toml` — web artifact routing and workflow configuration.

## Architecture decisions

- The first tool is fully client-side: generation uses handwritten templates and slot filling, while saved ideas use browser localStorage.
- Tool pages use nested paths so the homepage remains a directory as additional tools are added.
- Card export is generated in-browser with Canvas and downloaded as a PNG; no image bytes or user content leave the browser.
- The Genshin Impact route reuses the same generator surface with themed copy to establish the fandom SEO pattern.

## Product

- A welcoming directory homepage for future creative tools.
- Headcanon generation across Personality, Backstory, Quirks, Relationships, and Secrets.
- Lock, save, reroll, copy, and local persistence for generated ideas.
- Portrait share-card export with character name, five headcanons, and Fictual branding.
- Route-specific metadata and FAQ structured data for search visibility.

## User preferences

_No persistent preferences have been provided._

## Gotchas

- The static web workflow supplies `PORT` and `BASE_PATH`; run the artifact workflow rather than starting Vite manually.
- Saved content is intentionally browser-local and will not follow a user across devices or browsers.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
