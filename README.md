# CFblog

Reusable Astro blog template for deployment to Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/McHughCyber/CFblog)

## What this is

CFblog (`astro-cloudflare-blog-template`) is a **single-tenant** blog starter: Markdown posts, nested categories, menus, redirects, settings, and media metadata live in **D1**; uploaded files live in **R2**; the app runs on **Cloudflare Workers** (Astro server output). **Cloudflare Access** is the admin authentication perimeter.

It suits developers who want an editable blog on Workers without a separate CMS host.

## Architecture

| Layer | Cloudflare product |
| --- | --- |
| App runtime | Workers (Astro SSR) |
| Structured content | D1 |
| Uploaded media | R2 |
| Admin auth | Access (JWT validated in the Worker) |
| Optional cache | KV (`CFBLOG_CACHE`, advanced deploy only) |

AI Crawl Control and Pay Per Crawl are **zone-level** Cloudflare features; the app exposes cooperative hint files only (see [docs/ai-crawlers.md](docs/ai-crawlers.md)).

## MVP scope

- Posts as Markdown; nested categories; menus, redirects, settings, media metadata.
- Any identity allowed by your Access application is treated as an admin once the JWT validates.

## MVP non-goals

- No multi-tenant SaaS control plane.
- No visual page builder.
- No arbitrary browser-authored MDX.
- No in-app source code self-update.

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/getting-started.md](docs/getting-started.md) | Tutorial: clone to working local admin. |
| [docs/deployment.md](docs/deployment.md) | How-to: Deploy button, `pnpm deploy`, advanced configured deploy. |
| [docs/development-lifecycle.md](docs/development-lifecycle.md) | Explanation: GitHub workflows from development through release and downstream updates. |
| [docs/security-and-access.md](docs/security-and-access.md) | How-to: Access apps, JWT validation, local bypass, CI tokens. |
| [docs/operations.md](docs/operations.md) | How-to: backups, migrations, updates, rollout, recovery. |
| [docs/admin-guide.md](docs/admin-guide.md) | How-to: `/admin` features for operators. |
| [docs/configuration-reference.md](docs/configuration-reference.md) | Reference: scripts, bindings, vars, routes. |
| [docs/google-integrations.md](docs/google-integrations.md) | Google Analytics and AdSense. |
| [docs/ai-crawlers.md](docs/ai-crawlers.md) | Robots, `llms.txt`, crawlers.json, Cloudflare AI products. |
| [UPGRADING.md](UPGRADING.md) | Template updates, migrations, version model. |
| [CHANGELOG.md](CHANGELOG.md) | Release history. |

**Cloudflare Pages** is not a supported deploy target for this template.

## Quick local run

Requires Node.js `>=22.12.0` (see `.nvmrc`).

```sh
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install
pnpm db:migrations:apply:local
pnpm dev
```

For Wrangler-based preview, build then `pnpm preview`. Full walkthrough: [docs/getting-started.md](docs/getting-started.md).

## Deploy

Use the button above (deploy command **`pnpm deploy`**) or follow [docs/deployment.md](docs/deployment.md).

## Release target

A clean deployment should include seed content, D1/R2 bindings, protected admin routes, and applied migrations. Public routes can work before Access is configured; admin stays fail-closed until Access env vars are set ([docs/security-and-access.md](docs/security-and-access.md)).
