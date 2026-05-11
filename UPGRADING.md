# Upgrading CFblog

CFblog updates are intentionally Git-based. The app can show version status, but it does not rewrite its own source code.

## Version Model

| Value | Where it lives | Purpose |
| ----- | -------------- | ------- |
| Source template version | `src/lib/version.ts` | Version bundled with the currently deployed code. |
| Installed template version | D1 `settings.template.version` | Version recorded by migrations for this site. |
| Source schema version | `src/lib/version.ts` | Latest schema expected by the current code. |
| Installed schema version | D1 `settings.schema.version` | Schema marker recorded by migrations. |
| Applied migrations | D1 `schema_migrations` | App-level migration ledger shown in `/admin/update`. |

## Safe Update Flow

1. Create a branch for the update.
2. Back up the production D1 database.
3. Back up important R2 objects or confirm bucket retention/versioning outside the app.
4. Pull the upstream template changes into the branch.
5. Install dependencies and run tests locally.
6. Apply new migrations to a local or preview D1 database.
7. Run a Worker dry run.
8. Deploy to a preview Worker or staging environment.
9. Apply remote D1 migrations for production.
10. Deploy the production Worker.
11. Open `/admin/update` and confirm the installed schema and migration list.

## Git Update Flow

Add the template repository as an upstream remote once:

```sh
git remote add upstream https://github.com/your-github-user/astro-cloudflare-blog-template.git
```

Fetch and merge updates:

```sh
git fetch upstream
git checkout -b update/cfblog-template
git merge upstream/main
corepack pnpm install
corepack pnpm test
corepack pnpm build
```

Resolve conflicts by keeping site-specific configuration in your branch and template fixes from upstream. Do not overwrite `.env` or deployed Cloudflare resource IDs with placeholders.

## D1 Migration Flow

Apply migrations locally first:

```sh
corepack pnpm exec wrangler d1 migrations apply CFBLOG_DB --local
```

For production, use Wrangler’s remote migration mode after backups and preview validation. Ensure Workers Builds (or your shell) defines `CFBLOG_D1_DATABASE_NAME`, `CFBLOG_D1_DATABASE_ID`, and `CFBLOG_R2_BUCKET_NAME`, then either:

```sh
corepack pnpm db:migrations:apply
```

Or invoke Wrangler explicitly:

```sh
corepack pnpm wrangler:config
corepack pnpm exec wrangler d1 migrations apply CFBLOG_DB --remote --config wrangler.generated.jsonc
```

The app also records its schema marker in D1 settings. If Wrangler reports no pending migration but `/admin/update` shows a pending app-level migration, inspect `schema_migrations` before deploying further changes.

## Backup And Preview Checklist

- Export or copy production D1 before applying remote migrations.
- Keep R2 object keys stable; migrations should not rename media objects without an explicit rollback plan.
- Run `corepack pnpm wrangler:config` then `corepack pnpm exec wrangler deploy --dry-run --config wrangler.generated.jsonc` before deploying.
- Use a staging Worker and preview D1 database for risky changes.
- Confirm `/sitemap.xml`, `/rss.xml`, `/robots.txt`, `/llms.txt`, and one published post after the preview deploy.

## Optional Update Checks

Set `CFBLOG_UPDATE_CHECK_URL` to a static HTTPS URL if you want `/admin/update` to compare the deployed template version with an external latest-version marker.

The URL may return plain text:

```txt
0.1.1
```

Or JSON:

```json
{
  "version": "0.1.1",
  "releaseUrl": "https://example.com/releases/0.1.1",
  "notes": "Short release note."
}
```

The update check is read-only. It never pulls code, applies migrations, or deploys the Worker.

## Compatibility Table

| Template version | Schema version       | Required migrations                         |
| ---------------- | -------------------- | ------------------------------------------- |
| 0.1.0            | 0006_integrations_settings | 0001 through 0006 in order.        |
