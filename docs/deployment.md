# Deployment

Problem-oriented guide: ship CFblog to Cloudflare Workers with D1 and R2. For first-time local setup, complete [Getting started](getting-started.md) first. For variables and routes, use [Configuration reference](configuration-reference.md). For Access and admin protection, see [Security and Access](security-and-access.md).

## What you are deploying

CFblog runs as an **Astro** app on **Cloudflare Workers**, with **D1** for relational data and **R2** for uploaded media. **Cloudflare Access** protects `/admin` and `/api/admin`. **Cloudflare Pages** is not a supported target for this template.

Binding names in code are always `CFBLOG_DB`, `CFBLOG_MEDIA`, and optionally `CFBLOG_CACHE`; only the backing Cloudflare resources change per account or instance.

## Path 1: Deploy to Cloudflare (button)

1. Use the **Deploy to Cloudflare** button in the root [README](../README.md).
2. When prompted for the deploy command, keep **`pnpm deploy`** (see `package.json` `deploy` script: build, `wrangler deploy`, then remote D1 migrations).

The default flow uses committed **`wrangler.jsonc`**. Cloudflare can provision D1 and R2 from the declared bindings. You do **not** need `CFBLOG_D1_DATABASE_NAME`, `CFBLOG_D1_DATABASE_ID`, or `CFBLOG_R2_BUCKET_NAME` for this path.

## Path 2: Manual Workers deploy

1. Clone the repository and install dependencies (same as [Getting started](getting-started.md)).
2. Authenticate Wrangler, for example:

   ```sh
   pnpm exec wrangler login
   ```

3. Deploy:

   ```sh
   pnpm deploy
   ```

This uses `wrangler.jsonc` and applies remote migrations after the Worker deploys.

## After first deploy

1. Set **`SITE_URL`** to your real public origin (`*.workers.dev` or custom domain) via `wrangler.jsonc` `vars` or the Cloudflare dashboard.
2. Set **`ENVIRONMENT`** appropriately (for example `production` for the primary site).
3. Configure **Cloudflare Access** and set **`CF_ACCESS_TEAM_DOMAIN`** and **`CF_ACCESS_AUD`** as Worker secrets. Until then, admin routes may return **403**; public blog routes can still work. See [Security and Access](security-and-access.md).

The first migrations create schema and seed default settings and a welcome post.

## Path 3: Advanced configured deploy

Use this when you need **pre-provisioned** D1/R2 (or multiple Workers from one checkout) and a generated Wrangler file.

1. Set required environment variables (shell, `.env`, Workers Builds, or IaC):

   - `CFBLOG_D1_DATABASE_NAME`
   - `CFBLOG_D1_DATABASE_ID`
   - `CFBLOG_R2_BUCKET_NAME`

   Optional: `CFBLOG_KV_NAMESPACE_ID`, `CFBLOG_WORKER_NAME`, `CFBLOG_SITE_URL`, `CFBLOG_ENVIRONMENT`.

2. Generate config and deploy:

   ```sh
   pnpm deploy:configured
   ```

This writes **`wrangler.generated.jsonc`** (gitignored), applies remote migrations against that config, and deploys with it. Exact behaviour is documented in [Configuration reference](configuration-reference.md) under “Generated config”.

## CI test deploy

The repository’s GitHub Actions workflow can deploy a **configured** test stack and validate routes using **Access service tokens**. That is optional operator automation; variable and secret **names** are described in [Security and Access](security-and-access.md#ci-and-machine-access).

## Troubleshooting

### `D1_ERROR: no such table: settings`

The Worker is bound to a D1 database that has not received migrations. From a machine authenticated to the same Cloudflare project:

```sh
pnpm db:migrations:apply
pnpm deploy
```

Use `pnpm db:migrations:apply:configured` when your production deploy uses `wrangler.generated.jsonc`.
