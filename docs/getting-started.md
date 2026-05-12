# Getting started

This tutorial takes you from a fresh clone to a working CFblog instance on your machine. It is learning-oriented: follow the steps in order. For deploying to Cloudflare, continue with [Deployment](deployment.md).

## Prerequisites

- **Node.js** `>=22.12.0` (see `package.json` `engines` and `.nvmrc`).
- **pnpm** `10.10.0` — the repo expects Corepack to provide pnpm (see root `packageManager` field).

## Install dependencies

Enable Corepack and install pnpm if you have not already:

```sh
corepack enable
corepack prepare pnpm@10.10.0 --activate
```

In the repository root:

```sh
pnpm install
```

## Apply local D1 migrations

CFblog stores content in D1. Before the admin UI or most pages work locally, apply migrations to the **local** D1 database Wrangler uses:

```sh
pnpm db:migrations:apply:local
```

If something fails with missing tables, list migration status:

```sh
pnpm db:migrations:list:local
```

## Run the app locally

**Option A — Astro dev server** (fast iteration on UI and server code):

```sh
pnpm dev
```

**Option B — Production build + Wrangler dev** (closer to deployed behaviour):

```sh
pnpm build
pnpm preview
```

`pnpm preview` runs `wrangler dev` against your build output.

## Open the site and admin

- Open the public home URL shown in the terminal (often `http://localhost:4321` for `pnpm dev`, or `http://localhost:8787` for Wrangler dev depending on your config).
- Open `/admin`.

On **localhost** or **127.0.0.1** only, CFblog can skip Cloudflare Access JWT checks when `ENVIRONMENT` is `development` or when Astro is in dev mode. Deployed hosts always require a valid Access session (or service-token headers in automation). Details: [Security and Access](security-and-access.md).

## Next steps

- **Deploy to Cloudflare:** [Deployment](deployment.md) (Deploy button, `pnpm deploy`, or advanced configured deploy).
- **Scripts and env reference:** [Configuration reference](configuration-reference.md).
- **Operate a live site:** [Operations](operations.md).
