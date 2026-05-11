# CFblog

Reusable Astro blog template for deployment to Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/McHughCyber/CFblog)

## MVP Scope

CFblog is being built as `astro-cloudflare-blog-template`: a single-tenant blog starter that runs on Cloudflare Workers, stores editable blog content in D1, stores uploaded media in R2, and uses Cloudflare Access as the admin authentication perimeter.

The MVP content model is intentionally focused:

- Posts authored as Markdown.
- Nested categories.
- Configurable menus, redirects, settings, and media metadata as supporting records.

Any validated Cloudflare Access user for the configured Access application is treated as an admin. Server-side Access JWT validation is required before admin routes and APIs are considered complete.

## MVP Non-Goals

- No multi-tenant SaaS control plane.
- No visual page builder.
- No arbitrary browser-authored MDX.
- No in-app source code self-update.

## Supported Cloudflare Products

- Workers: Astro server rendering and deployment target.
- D1: canonical store for content, settings, revisions, redirects, menus, and media metadata.
- R2: uploaded images and attachments.
- Access: admin route and API protection.
- KV: optional low-risk cache acceleration only.
- AI Crawl Control and Pay Per Crawl: documented as Cloudflare-level configuration, not app-owned billing logic.

## Release Target

The MVP target is a working `*.workers.dev` deployment with custom-domain compatibility. A clean deployment should include seed content, declared D1/R2 bindings, protected admin routes, and local-to-remote migration instructions.

## Local Development

Use Node.js `>=22.12.0`; the repo includes `.nvmrc` for version managers that support it.

Install dependencies with pnpm:

```sh
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install
```

Useful scripts:

```sh
pnpm dev
pnpm build
pnpm preview
pnpm deploy
pnpm db:migrations:apply
pnpm db:migrations:apply:local
pnpm db:migrations:list
pnpm db:migrations:list:local
pnpm wrangler:config
pnpm test
```

`wrangler.jsonc` holds Worker-wide defaults (script name, compatibility flags, static asset binding, `vars`). Remote resource bindings (`CFBLOG_DB`, `CFBLOG_MEDIA`, optional `CFBLOG_CACHE`) are **not** committed per physical database or bucket: `pnpm wrangler:config` reads environment variables and writes `wrangler.generated.jsonc` (ignored by Git), which `pnpm deploy` and remote D1 scripts use. That lets one tenancy host multiple independent CFblog stacks by giving each Workers Builds project or shell session different binding env vars.

For local-only D1 migrations, use `pnpm db:migrations:apply:local`, which keeps using `wrangler.jsonc`. Remote migrations and deploy require the env vars below first.

Before opening local admin pages with `pnpm dev` or `pnpm preview`, apply local D1 migrations once:

```sh
corepack pnpm db:migrations:apply:local
```

If a local page crashes with a D1 missing-table error from `.vite` or `src/lib/db/client.ts`, check pending local migrations:

```sh
corepack pnpm db:migrations:list:local
```

## Deployment

CFblog supports two deployment paths:

- Primary: Deploy to Cloudflare button targeting Workers Builds.
- Manual Workers: clone the repository, configure values, apply migrations, and run `pnpm deploy`.

Cloudflare Pages is not a supported target for this template.

### Primary: Deploy to Cloudflare

Use the Deploy to Cloudflare button at the top of this README. The button opens:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/McHughCyber/CFblog
```

During setup, keep the generated deploy command set to the package script:

```sh
pnpm deploy
```

In **Workers and Pages → your Worker → Settings → Variables and Secrets**, define plaintext variables for each deployed instance (use different values per blog instance in the same account):

| Variable | Required | Purpose |
|---|---:|---|
| `CFBLOG_D1_DATABASE_NAME` | Yes | Human-readable D1 name you created (for example `my-blog-a-db`). Must match the database name shown in the dashboard or from `wrangler d1 create`. |
| `CFBLOG_D1_DATABASE_ID` | Yes | UUID for that D1 database (`wrangler d1 info <name>` or dashboard). |
| `CFBLOG_R2_BUCKET_NAME` | Yes | R2 bucket name for media for this instance. |
| `CFBLOG_KV_NAMESPACE_ID` | No | KV namespace id if you want the optional `CFBLOG_CACHE` binding; omit entirely to deploy without KV. |
| `CFBLOG_WORKER_NAME` | No | Overrides `wrangler.jsonc` `name` so multiple Workers can deploy from one repo without editing files (for example `cfblog-marketing`, `cfblog-internal`). |
| `CFBLOG_SITE_URL` | Strongly recommended | Overrides `vars.SITE_URL` for this deployment (for example your `*.workers.dev` URL). |
| `CFBLOG_ENVIRONMENT` | No | Overrides `vars.ENVIRONMENT` if you need something other than the committed default. |

Binding names in Worker code stay **`CFBLOG_DB`**, **`CFBLOG_MEDIA`**, **`CFBLOG_CACHE`**; only the backing Cloudflare resources change between instances.

Review these runtime values during or immediately after the first deployment:

| Value | Required | Purpose |
|---|---:|---|
| `SITE_URL` | Yes (via env or `wrangler.jsonc`) | Public site origin used for canonical URLs, feeds, sitemap output, and admin mutation origin checks. Prefer `CFBLOG_SITE_URL` on Workers Builds. |
| `ENVIRONMENT` | Yes | Runtime environment label. Use `production` for the primary deployment unless overridden with `CFBLOG_ENVIRONMENT`. |
| `CF_ACCESS_TEAM_DOMAIN` | Required for admin | Cloudflare Access team domain, for example `https://your-team.cloudflareaccess.com`. |
| `CF_ACCESS_AUD` | Required for admin | Cloudflare Access application audience tag for the admin application. |

Admin routes fail closed until Cloudflare Access is configured and both Access values are set. Public blog routes, feeds, and crawler files remain available.

The deploy script regenerates binding config, applies remote D1 migrations, then deploys using `wrangler.generated.jsonc`.

If a fresh deployment returns `D1_ERROR: no such table: settings`, the Worker is bound to a D1 database that has not received the migrations yet. From the generated repository, run the remote migration script against the same Cloudflare project, then redeploy:

```sh
corepack pnpm install
corepack pnpm deploy
```

The first migration creates the `settings` table; the second migration seeds the default site settings and welcome post.

### Manual Workers Deployment

Clone the repository and install dependencies:

```sh
git clone https://github.com/McHughCyber/CFblog.git
cd CFblog
corepack enable
corepack prepare pnpm@10.10.0 --activate
corepack pnpm install
```

Authenticate Wrangler with a scoped Cloudflare API token:

```sh
corepack pnpm exec wrangler login
```

Configure `SITE_URL` and `ENVIRONMENT` via `CFBLOG_SITE_URL` / `CFBLOG_ENVIRONMENT` when generating config, or edit defaults under `vars` in `wrangler.jsonc`. Configure the Access values for admin protection as Worker secrets (after generating config so Wrangler targets the correct Worker name):

```sh
corepack pnpm wrangler:config
corepack pnpm exec wrangler secret put CF_ACCESS_TEAM_DOMAIN --config wrangler.generated.jsonc
corepack pnpm exec wrangler secret put CF_ACCESS_AUD --config wrangler.generated.jsonc
```

Then apply remote migrations and deploy:

```sh
corepack pnpm db:migrations:apply
corepack pnpm deploy
```

You can drive the same variables from Terraform, Pulumi, or another provisioner by exporting them in the shell before `pnpm wrangler:config` or by injecting them into the Workers Builds environment.

## Admin Protection

Admin routes and admin API routes are protected by Cloudflare Access JWT validation. In local development only, requests to `localhost`/`127.0.0.1` can bypass Access JWT checks when `ENVIRONMENT=development` (or Astro dev mode). See [Cloudflare Access setup](docs/access-setup.md) for full behaviour and required configuration.

## AI Crawler Guidance

CFblog serves `/robots.txt`, `/llms.txt`, `/llms-full.txt`, and `/crawlers.json` from D1-backed settings. Configure crawler-facing descriptions and robots policy from `/admin/settings`. Cloudflare AI Crawl Control and Pay Per Crawl enforcement still happens in the Cloudflare dashboard; see [AI crawler management](docs/ai-crawlers.md).

## Google Integrations

Google Analytics and Google AdSense are optional and disabled by default. Configure them from `/admin/settings` with Google IDs rather than pasted scripts. See [Google integrations](docs/google-integrations.md) for setup, manual AdSense placements, and privacy/consent notes.

## Updates

CFblog updates are Git-based: pull template changes, test them, apply D1 migrations, and deploy the Worker. The admin panel includes `/admin/update` for installed template/schema visibility and an optional read-only update check. See [UPGRADING.md](UPGRADING.md) and [CHANGELOG.md](CHANGELOG.md).

## Development Environment Variables

Local development and Wrangler deployment use dotenv-style environment variables from `.env`. The real `.env` file must stay local and must not be committed or shared with AI tooling.

Current development variables:

```dotenv
SITE_URL=http://localhost:8787
ENVIRONMENT=development

CLOUDFLARE_ACCOUNT_ID=REDACTED
CLOUDFLARE_API_KEY=REDACTED

CF_ACCESS_TEAM_DOMAIN=https://mchughcyber.cloudflareaccess.com
CF_ACCESS_AUD=REDACTED

# Remote deploy / multi-instance (also set these in Workers Builds). Optional locally if you run deploy from your machine.
CFBLOG_D1_DATABASE_NAME=my-blog-db
CFBLOG_D1_DATABASE_ID=00000000-0000-0000-0000-000000000000
CFBLOG_R2_BUCKET_NAME=my-blog-media
# CFBLOG_KV_NAMESPACE_ID=
# CFBLOG_WORKER_NAME=cfblog-my-instance
# CFBLOG_SITE_URL=https://cfblog-my-instance.subdomain.workers.dev
```

Variable purpose:

| Variable | Purpose | Notes |
|---|---|---|
| `SITE_URL` | Base URL used by the app for canonical URLs, feeds, sitemap output, and local links. | Use `http://localhost:8787` for local Wrangler development. |
| `ENVIRONMENT` | Runtime environment label. | Use `development`, `staging`, or `production`. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account used by Wrangler. | Required for deployment and resource operations. |
| `CLOUDFLARE_API_KEY` | Cloudflare credential currently present in local `.env`. | Prefer `CLOUDFLARE_API_TOKEN` for Wrangler automation when possible. |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access team domain used for JWT verification. | Example format: `https://<team-name>.cloudflareaccess.com`. |
| `CF_ACCESS_AUD` | Cloudflare Access application audience tag. | Required for validating `Cf-Access-Jwt-Assertion` on admin routes. |
| `CFBLOG_D1_DATABASE_NAME` | D1 database name for this CFblog instance. | Required for `pnpm db:migrations:apply` / `pnpm deploy`; ignored by local-only `db:migrations:apply:local`. |
| `CFBLOG_D1_DATABASE_ID` | D1 database UUID. | Same as above. |
| `CFBLOG_R2_BUCKET_NAME` | R2 bucket for uploads for this instance. | Same as above. |
| `CFBLOG_KV_NAMESPACE_ID` | KV namespace id for optional cache binding. | Omit to deploy without KV. |
| `CFBLOG_WORKER_NAME` | Worker script name for this instance. | Overrides `name` in `wrangler.jsonc` when set. |
| `CFBLOG_SITE_URL` | Deployed public origin. | Written into generated Wrangler `vars` when set. |
| `CFBLOG_ENVIRONMENT` | Runtime label for generated deploy. | Overrides default `vars.ENVIRONMENT` when set. |

Recommended Wrangler authentication variable:

```dotenv
CLOUDFLARE_API_TOKEN=REDACTED
```

Wrangler supports `CLOUDFLARE_API_KEY`, but that is the older global-key style and normally pairs with `CLOUDFLARE_EMAIL`. For this project, prefer a scoped `CLOUDFLARE_API_TOKEN` with only the permissions needed for Workers, D1, R2, and related deployment resources.

## Secret Handling

- Keep `.env` out of Git.
- Keep `.env` out of AI context where possible.
- Store production secrets in Cloudflare Worker secrets or CI/CD secret storage.
- Supply D1/R2/KV identifiers via Workers Builds variables or local `.env` for `pnpm wrangler:config`; they are written only to gitignored `wrangler.generated.jsonc`, not committed alongside `wrangler.jsonc`.
- If a Cloudflare credential is exposed, rotate it immediately in the Cloudflare dashboard.
