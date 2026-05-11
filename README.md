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
pnpm deploy:configured
pnpm db:migrations:apply
pnpm db:migrations:apply:local
pnpm db:migrations:list
pnpm db:migrations:list:local
pnpm wrangler:config
pnpm test
```

`wrangler.jsonc` is the primary deploy configuration. It includes Worker defaults, static assets, D1 and R2 binding names, deployable default resource names, and runtime `vars`. The Deploy to Cloudflare button and the default `pnpm deploy` script use this file directly so a first deployment does not require pre-created D1/R2 resources or `CFBLOG_*` variables.

For local-only D1 migrations, use `pnpm db:migrations:apply:local`. For remote migrations on an already provisioned deployment, use `pnpm db:migrations:apply`; it targets the `CFBLOG_DB` binding declared in `wrangler.jsonc`.

Advanced operators who need pre-provisioned resources or multiple independent stacks from one source checkout can still run `pnpm wrangler:config` and `pnpm deploy:configured`. That path writes a gitignored `wrangler.generated.jsonc` from environment variables.

Before opening local admin pages with `pnpm dev` or `pnpm preview`, apply local D1 migrations once:

```sh
corepack pnpm db:migrations:apply:local
```

If a local page crashes with a D1 missing-table error from `.vite` or `src/lib/db/client.ts`, check pending local migrations:

```sh
corepack pnpm db:migrations:list:local
```

## Deployment

CFblog supports these deployment paths:

- Primary: Deploy to Cloudflare button targeting Workers Builds.
- Manual Workers: clone the repository, authenticate Wrangler, and run `pnpm deploy`.
- Advanced configured deploy: use pre-provisioned resources and `wrangler.generated.jsonc`.

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

The default deploy uses `wrangler.jsonc` directly. Cloudflare can provision D1 and R2 from the committed `CFBLOG_DB` and `CFBLOG_MEDIA` bindings. `pnpm deploy` publishes the Worker first so Cloudflare can link the D1 resource, then applies remote D1 migrations before the command completes.

Binding names in Worker code stay **`CFBLOG_DB`**, **`CFBLOG_MEDIA`**, **`CFBLOG_CACHE`**; only the backing Cloudflare resources change between instances.

No `CFBLOG_D1_DATABASE_NAME`, `CFBLOG_D1_DATABASE_ID`, or `CFBLOG_R2_BUCKET_NAME` variables are required for a normal first deployment.

### After First Deploy

Review these runtime values during or immediately after deployment:

| Value | Required | Purpose |
|---|---:|---|
| `SITE_URL` | Yes (via `wrangler.jsonc` vars) | Public site origin used for canonical URLs, feeds, sitemap output, and admin mutation origin checks. Update it to your `*.workers.dev` or custom-domain origin after deploy. |
| `ENVIRONMENT` | Yes | Runtime environment label. Use `production` for the primary deployment. |
| `CF_ACCESS_TEAM_DOMAIN` | Required for admin | Cloudflare Access team domain, for example `https://your-team.cloudflareaccess.com`. |
| `CF_ACCESS_AUD` | Required for admin | Cloudflare Access application audience tag for the admin application. |

Public blog routes, feeds, and crawler files should work after `pnpm deploy` completes and migrations have run. Admin routes fail closed until Cloudflare Access is configured and both Access values are set; a `403` from `/admin` before Access setup is expected.

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

Deploy with the normal script:

```sh
corepack pnpm deploy
```

The normal path uses `wrangler.jsonc`; it does not require you to create D1/R2 manually or set `CFBLOG_*` values first.

Configure `SITE_URL` by editing `vars.SITE_URL` in `wrangler.jsonc` or by setting the deployed Worker variable after the first deploy. Configure Access values for admin protection as Worker secrets:

```sh
corepack pnpm exec wrangler secret put CF_ACCESS_TEAM_DOMAIN
corepack pnpm exec wrangler secret put CF_ACCESS_AUD
```

### Advanced: Multi-Instance Or Pre-Provisioned Resources

Use the configured deploy path when you need deterministic resource IDs, pre-provisioned D1/R2 resources, optional KV, or many independent CFblog stacks from one source repo.

Set these values in the shell, `.env`, Workers Builds variables, Terraform, Pulumi, or another provisioner:

| Variable | Required | Purpose |
|---|---:|---|
| `CFBLOG_D1_DATABASE_NAME` | Yes | Human-readable D1 database name for this instance. |
| `CFBLOG_D1_DATABASE_ID` | Yes | UUID for the D1 database. |
| `CFBLOG_R2_BUCKET_NAME` | Yes | R2 bucket name for media for this instance. |
| `CFBLOG_KV_NAMESPACE_ID` | No | KV namespace id if you want the optional `CFBLOG_CACHE` binding; omit entirely to deploy without KV. |
| `CFBLOG_WORKER_NAME` | No | Overrides `wrangler.jsonc` `name` so multiple Workers can deploy from one repo without editing files. |
| `CFBLOG_SITE_URL` | No | Overrides `vars.SITE_URL` in `wrangler.generated.jsonc`. |
| `CFBLOG_ENVIRONMENT` | No | Overrides `vars.ENVIRONMENT` in `wrangler.generated.jsonc`. |

Then run:

```sh
corepack pnpm deploy:configured
```

This writes `wrangler.generated.jsonc`, applies remote D1 migrations against that generated config, and deploys with the generated config.

### Deployment Troubleshooting

If a deployed site returns `D1_ERROR: no such table: settings`, the Worker is bound to a D1 database that has not received the migrations yet. Run the remote migration script against the same Cloudflare project, then redeploy:

```sh
corepack pnpm db:migrations:apply
corepack pnpm deploy
```

## Admin Protection

Admin routes and admin API routes are protected by Cloudflare Access JWT validation. In local development only, requests to `localhost`/`127.0.0.1` can bypass Access JWT checks when `ENVIRONMENT=development` (or Astro dev mode). See [Cloudflare Access setup](docs/access-setup.md) for full behaviour and required configuration.

## AI Crawler Guidance

CFblog serves `/robots.txt`, `/llms.txt`, `/llms-full.txt`, and `/crawlers.json` from D1-backed settings. Configure crawler-facing descriptions and robots policy from `/admin/settings`. Cloudflare AI Crawl Control and Pay Per Crawl enforcement still happens in the Cloudflare dashboard; see [AI crawler management](docs/ai-crawlers.md).

## Google Integrations

Google Analytics and Google AdSense are optional and disabled by default. Configure them from `/admin/settings` with Google IDs rather than pasted scripts. See [Google integrations](docs/google-integrations.md) for setup, manual AdSense placements, and privacy/consent notes.

## Updates

CFblog updates are Git-based: pull template changes, test them, apply D1 migrations, and deploy the Worker. The admin panel includes `/admin/update` for installed template/schema visibility and an optional read-only update check. See [UPGRADING.md](UPGRADING.md) and [CHANGELOG.md](CHANGELOG.md).

## Development Environment Variables

Local development can use dotenv-style environment variables from `.env` or `.dev.vars`. The real files must stay local and must not be committed or shared with AI tooling. The default deploy path does not require D1/R2 identifiers in environment variables.

Current development variables:

```dotenv
SITE_URL=http://localhost:8787
ENVIRONMENT=development

CLOUDFLARE_ACCOUNT_ID=REDACTED
CLOUDFLARE_API_KEY=REDACTED

CF_ACCESS_TEAM_DOMAIN=https://mchughcyber.cloudflareaccess.com
CF_ACCESS_AUD=REDACTED

# Advanced configured deploy / multi-instance only.
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
| `CFBLOG_D1_DATABASE_NAME` | D1 database name for an advanced configured deploy. | Not used by primary `pnpm deploy`; required by `pnpm deploy:configured`. |
| `CFBLOG_D1_DATABASE_ID` | D1 database UUID for an advanced configured deploy. | Not used by primary `pnpm deploy`; required by `pnpm deploy:configured`. |
| `CFBLOG_R2_BUCKET_NAME` | R2 bucket for an advanced configured deploy. | Not used by primary `pnpm deploy`; required by `pnpm deploy:configured`. |
| `CFBLOG_KV_NAMESPACE_ID` | KV namespace id for optional cache binding in configured deploys. | Omit to deploy without KV. |
| `CFBLOG_WORKER_NAME` | Worker script name for a configured deploy. | Overrides `name` in generated config when set. |
| `CFBLOG_SITE_URL` | Deployed public origin for a configured deploy. | Written into generated Wrangler `vars` when set. |
| `CFBLOG_ENVIRONMENT` | Runtime label for a configured deploy. | Overrides default `vars.ENVIRONMENT` in generated config when set. |

Recommended Wrangler authentication variable:

```dotenv
CLOUDFLARE_API_TOKEN=REDACTED
```

Wrangler supports `CLOUDFLARE_API_KEY`, but that is the older global-key style and normally pairs with `CLOUDFLARE_EMAIL`. For this project, prefer a scoped `CLOUDFLARE_API_TOKEN` with only the permissions needed for Workers, D1, R2, and related deployment resources.

## Secret Handling

- Keep `.env` out of Git.
- Keep `.env` out of AI context where possible.
- Store production secrets in Cloudflare Worker secrets or CI/CD secret storage.
- Use the committed `wrangler.jsonc` for normal deploys; it does not need D1/R2 identifiers in `.env`.
- For advanced configured deploys, supply D1/R2/KV identifiers via Workers Builds variables or local `.env` for `pnpm wrangler:config`; they are written only to gitignored `wrangler.generated.jsonc`.
- If a Cloudflare credential is exposed, rotate it immediately in the Cloudflare dashboard.
