# Configuration reference

Technical lookup for package scripts, Wrangler configuration, runtime variables, and HTTP routes. Narrative guides live in [Getting started](getting-started.md), [Deployment](deployment.md), [Security and Access](security-and-access.md), [Operations](operations.md), and [Admin guide](admin-guide.md).

## Package scripts

Defined in `package.json`. Run with `pnpm <script>` (or `corepack pnpm <script>` if you use Corepack).

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `astro dev` | Local Astro dev server. |
| `build` | `astro check && astro build` | Typecheck and production build. |
| `preview` | `wrangler dev` | Run the built Worker locally against Wrangler dev. |
| `wrangler:config` | `node scripts/generate-wrangler-config.mjs` | Writes gitignored `wrangler.generated.jsonc` from `wrangler.jsonc` plus `CFBLOG_*` env vars. |
| `deploy` | `pnpm run build && wrangler deploy && pnpm run db:migrations:apply` | Default production-style deploy using `wrangler.jsonc`, then remote D1 migrations. |
| `deploy:configured` | `pnpm run build && pnpm run db:migrations:apply:configured && wrangler deploy --config wrangler.generated.jsonc` | Advanced deploy using generated config. |
| `db:migrations:apply` | `wrangler d1 migrations apply CFBLOG_DB --remote --yes` | Apply pending migrations to remote D1 bound as `CFBLOG_DB` in `wrangler.jsonc`. |
| `db:migrations:apply:configured` | `pnpm run wrangler:config && wrangler d1 migrations apply CFBLOG_DB --remote --config wrangler.generated.jsonc --yes` | Remote migrations against generated config. |
| `db:migrations:apply:local` | `wrangler d1 migrations apply CFBLOG_DB --local` | Apply migrations to local D1 (Wrangler dev). |
| `db:migrations:list` | `wrangler d1 migrations list CFBLOG_DB --remote` | List remote migration status. |
| `db:migrations:list:configured` | `pnpm run wrangler:config && wrangler d1 migrations list CFBLOG_DB --remote --config wrangler.generated.jsonc` | List remote migration status for generated config. |
| `db:migrations:list:local` | `wrangler d1 migrations list CFBLOG_DB --local` | List local migration status. |
| `test` | `vitest run --passWithNoTests` | Unit tests. |

## Wrangler: default config (`wrangler.jsonc`)

Primary file for the Deploy to Cloudflare button path and `pnpm deploy`.

| Field / binding | Value / role |
| --- | --- |
| Worker `name` | `cfblog` (overridable via advanced deploy). |
| `main` | `@astrojs/cloudflare/entrypoints/server` |
| `assets.binding` | `ASSETS` (Astro static client assets). |
| `d1_databases[0].binding` | `CFBLOG_DB` |
| `d1_databases[0].database_name` | Default D1 resource name (e.g. `cfblog-db`). |
| `d1_databases[0].migrations_dir` | `migrations` |
| `r2_buckets[0].binding` | `CFBLOG_MEDIA` |
| `r2_buckets[0].bucket_name` | Default R2 bucket name (e.g. `cfblog-media`). |
| `vars.ENVIRONMENT` | Runtime label (e.g. `production`). |
| `vars.SITE_URL` | Public origin; replace after first deploy. |

Optional KV (`CFBLOG_CACHE`) is not declared in the committed `wrangler.jsonc`; it appears only in advanced generated config when `CFBLOG_KV_NAMESPACE_ID` is set.

## Generated config (`wrangler.generated.jsonc`)

Produced by `pnpm wrangler:config` (`scripts/generate-wrangler-config.mjs`).

**Required environment variables before generation:**

- `CFBLOG_D1_DATABASE_NAME` — human-readable D1 database name.
- `CFBLOG_D1_DATABASE_ID` — D1 database UUID.
- `CFBLOG_R2_BUCKET_NAME` — R2 bucket name for media.

The script loads `.env` into `process.env` if present, then merges the base `wrangler.jsonc` with:

- `name` from `CFBLOG_WORKER_NAME` or base `name`.
- D1 entry with binding `CFBLOG_DB`, `database_name`, `database_id`, and the same `migrations_dir` as base.
- R2 entry with binding `CFBLOG_MEDIA` and `bucket_name`.
- `vars` merged from base plus optional `SITE_URL` from `CFBLOG_SITE_URL` and optional `ENVIRONMENT` from `CFBLOG_ENVIRONMENT`.
- `kv_namespaces` with binding `CFBLOG_CACHE` and `id` from `CFBLOG_KV_NAMESPACE_ID` when set; otherwise KV is omitted.

Output path: repository root `wrangler.generated.jsonc` (gitignored).

## Runtime bindings (Worker code)

Binding names in application code are stable:

| Binding | Type | Role |
| --- | --- | --- |
| `CFBLOG_DB` | D1 | Posts, categories, menus, media metadata, redirects, settings, revisions, schema tracking. |
| `CFBLOG_MEDIA` | R2 | Uploaded file bytes. |
| `CFBLOG_CACHE` | KV (optional) | Low-risk cache only; not required for core blog behaviour. |
| `ASSETS` | Assets | Astro-built static assets. |

## `package.json` `cloudflare.bindings`

The `cloudflare.bindings` object in `package.json` documents bindings for editors and tooling. It is not read by the Worker at runtime; Wrangler config and deployed resources are authoritative.

## Worker variables and secrets

### Committed or dashboard `vars` (non-secret)

| Name | Role |
| --- | --- |
| `SITE_URL` | Public site origin: canonical URLs, feeds, sitemap, admin mutation origin checks. |
| `ENVIRONMENT` | Label such as `development`, `staging`, or `production`. |

### Secrets (typical names)

Store in Worker secrets or CI secret storage; do not commit.

| Name | Role |
| --- | --- |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access team base URL (issuer), e.g. `https://your-team.cloudflareaccess.com`. |
| `CF_ACCESS_AUD` | Access application audience (AUD) tag for admin JWT validation. |

### Optional Worker vars

| Name | Role |
| --- | --- |
| `CFBLOG_UPDATE_CHECK_URL` | HTTPS URL returning version JSON or plain text; feeds `/admin/update` and related API. For upstream CFblog, use `https://github.com/McHughCyber/CFblog/releases/latest/download/latest.json`. |
| `CFBLOG_UPDATE_WORKFLOW_URL` | Optional link to the site owner’s GitHub Actions update workflow (display only). |

### Advanced deploy / generator inputs (`CFBLOG_*`)

Used with `pnpm wrangler:config` / `pnpm deploy:configured` (and CI configured deploy). Not required for the default `pnpm deploy` path.

| Name | Required for advanced path | Role |
| --- | ---: | --- |
| `CFBLOG_D1_DATABASE_NAME` | Yes | D1 database name written into generated config. |
| `CFBLOG_D1_DATABASE_ID` | Yes | D1 database UUID. |
| `CFBLOG_R2_BUCKET_NAME` | Yes | R2 bucket name. |
| `CFBLOG_KV_NAMESPACE_ID` | No | When set, adds `CFBLOG_CACHE` KV binding to generated config. |
| `CFBLOG_WORKER_NAME` | No | Overrides Worker `name` in generated config. |
| `CFBLOG_SITE_URL` | No | Sets `vars.SITE_URL` in generated config when present. |
| `CFBLOG_ENVIRONMENT` | No | Sets `vars.ENVIRONMENT` in generated config when present. |

### Local development files

Wrangler and tooling may read `.env` or `.dev.vars` locally. Never commit real credentials. For Wrangler automation, prefer a scoped `CLOUDFLARE_API_TOKEN` over legacy global API key patterns.

## Public HTTP routes

| Path | Notes |
| --- | --- |
| `/` | Home and blog entry. |
| `/rss.xml` | RSS feed. |
| `/sitemap.xml` | XML sitemap. |
| `/robots.txt` | Robots policy (D1-backed settings). |
| `/llms.txt` | AI-oriented site summary. |
| `/llms-full.txt` | Extended AI context. |
| `/crawlers.json` | Machine-readable crawler metadata. |
| `/media/{id}` | Public media by asset id; `public_path` in D1 must match `/media/{id}`. |
| Dynamic post/category paths | Served by `[...path].astro` according to stored slugs and category paths. |

## Admin HTTP routes

All admin HTML and admin API routes require Cloudflare Access JWT validation in deployed environments, except the documented local development bypass. See [Security and Access](security-and-access.md).

### Admin UI (`/admin`)

| Path | Purpose |
| --- | --- |
| `/admin` | Dashboard. |
| `/admin/posts` | Post list. |
| `/admin/posts/new` | New post. |
| `/admin/posts/{id}/edit` | Edit post. |
| `/admin/posts/{id}/preview` | Preview rendered post. |
| `/admin/categories` | Category list. |
| `/admin/categories/new` | New category. |
| `/admin/categories/{id}/edit` | Edit category. |
| `/admin/menus` | Menu list. |
| `/admin/menus/{menuKey}` | Menu detail. |
| `/admin/menus/{menuKey}/items/new` | New menu item. |
| `/admin/menus/{menuKey}/items/{itemId}/edit` | Edit menu item. |
| `/admin/media` | Media library uploads and metadata. |
| `/admin/theme` | Theme settings. |
| `/admin/settings` | Site settings, AI traffic hints, Google integrations. |
| `/admin/update` | Template/schema/update status. |

### Admin API (`/api/admin`)

JSON and mutation endpoints used by the admin UI (examples; not every method on every route):

| Path pattern | Role |
| --- | --- |
| `/api/admin/posts` | Post collection create/list. |
| `/api/admin/posts/{id}` | Post read/update/delete. |
| `/api/admin/posts/{id}/revisions/{revisionId}` | Revision fetch. |
| `/api/admin/categories`, `/api/admin/categories/{id}` | Categories. |
| `/api/admin/menus/...` | Menus and items. |
| `/api/admin/media`, `/api/admin/media/{id}` | Media upload and asset operations. |
| `/api/admin/theme` | Theme persistence. |
| `/api/admin/settings/integrations` | Google and related integration settings. |
| `/api/admin/settings/ai-traffic` | AI crawler hint settings. |
| `/api/admin/markdown-preview` | Markdown preview for editor. |
| `/api/admin/update-check` | Read-only upstream version check. |
| `/api/admin/probe` | Health/diagnostic probe. |

Middleware treats any path starting with `/admin` or `/api/admin` as admin-protected (see `src/middleware.ts`).
