# Operations

How to run, back up, update, and recover a **live** CFblog instance. For first deploy, see [Deployment](deployment.md). For the GitHub workflow lifecycle, see [Development and Release Lifecycle](development-lifecycle.md). For scripts and bindings, see [Configuration reference](configuration-reference.md). Template version and schema detail also live in [UPGRADING.md](../UPGRADING.md).

## Backups

- **D1:** Export or copy the production database before risky migrations. Use Cloudflare dashboard tools or Wrangler D1 export commands appropriate to your account workflow.
- **R2:** Preserve important objects; keep object keys stable unless you have a migration and rollback plan. Consider bucket versioning or periodic exports outside the app.

## Migrations

List and apply migrations with the `pnpm` scripts in [Configuration reference](configuration-reference.md#package-scripts).

Typical patterns:

- **Local:** `pnpm db:migrations:apply:local` / `pnpm db:migrations:list:local`
- **Remote (default wrangler.jsonc):** `pnpm db:migrations:apply` / `pnpm db:migrations:list`
- **Remote (generated config):** `pnpm db:migrations:apply:configured` / `pnpm db:migrations:list:configured`

The default **`pnpm deploy`** path applies remote migrations after deploy. If Wrangler reports no pending migration but **`/admin/update`** still shows pending app-level work, inspect D1 `schema_migrations` before continuing (see [UPGRADING.md](../UPGRADING.md)).

## Updates from upstream

CFblog does **not** self-update source from inside the Worker. Source lives in Git; content lives in D1 and R2.

Recommended path:

1. Run the **Update CFblog from upstream** GitHub workflow (or merge upstream manually as in [UPGRADING.md](../UPGRADING.md)).
2. Review the opened PR, `CHANGELOG.md`, `UPGRADING.md`, schema version, and listed migrations.
3. Back up production D1 and important R2 objects before applying migrations.
4. Validate with local or preview D1 migrations and a staging Worker when the change is risky.
5. After merge, let Workers Builds or your deployment process run the deploy command; the deploy script applies remote D1 migrations.

Optional: set **`CFBLOG_UPDATE_CHECK_URL`** to the upstream latest release asset and **`CFBLOG_UPDATE_WORKFLOW_URL`** to your update workflow so **`/admin/update`** shows latest version metadata and a link to your workflow. Those URLs are read-only hints; they do not trigger Actions.

```txt
https://github.com/McHughCyber/CFblog/releases/latest/download/latest.json
```

## Rollout checklist

- Back up production D1 (and critical R2 objects).
- Run `pnpm test` and `pnpm build` on the release branch.
- Consider `pnpm exec wrangler deploy --dry-run` (and the configured equivalent if you use generated config).
- Deploy to a staging Worker when the change is high risk; smoke-test `/`, a published post, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
- Merge and deploy production; confirm **`/admin/update`** and public routes.

## Recovery notes

- **Wrong D1 bound:** Fix Wrangler bindings or generated config so the Worker points at the database that already has your content and migrations.
- **Missing tables after deploy:** Run remote migrations against the same project, then redeploy (see [Deployment](deployment.md#troubleshooting)).
