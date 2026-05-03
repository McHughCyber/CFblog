# CFblog

Reusable Astro blog template for deployment to Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-github-user/astro-cloudflare-blog-template)

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
pnpm test
```

Before running Wrangler preview or deploy, replace placeholder binding IDs in `wrangler.jsonc` with real Cloudflare resource IDs.

## Admin Protection

Admin routes and admin API routes are protected by Cloudflare Access JWT validation. See [Cloudflare Access setup](docs/access-setup.md) for the required Access application and environment configuration.

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

Recommended Wrangler authentication variable:

```dotenv
CLOUDFLARE_API_TOKEN=REDACTED
```

Wrangler supports `CLOUDFLARE_API_KEY`, but that is the older global-key style and normally pairs with `CLOUDFLARE_EMAIL`. For this project, prefer a scoped `CLOUDFLARE_API_TOKEN` with only the permissions needed for Workers, D1, R2, and related deployment resources.

## Secret Handling

- Keep `.env` out of Git.
- Keep `.env` out of AI context where possible.
- Store production secrets in Cloudflare Worker secrets or CI/CD secret storage.
- Do not place D1 database IDs, R2 bucket names, or KV namespace IDs in `.env` unless there is a specific local workflow reason; those values usually belong in `wrangler.jsonc`.
- If a Cloudflare credential is exposed, rotate it immediately in the Cloudflare dashboard.
