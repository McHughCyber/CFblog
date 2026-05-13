# Upgrading CFblog

**Documentation map:** [README](README.md) lists all guides. Operator runbooks: [docs/operations.md](docs/operations.md). Security: [docs/security-and-access.md](docs/security-and-access.md).

CFblog updates are intentionally Git-based. The app can show version status and link to a manual GitHub workflow, but it does not rewrite its own source code or store GitHub/Cloudflare write credentials.

## Version Model

| Value | Where it lives | Purpose |
| ----- | -------------- | ------- |
| Source template version | `src/lib/version.ts` | Version bundled with the currently deployed code. |
| Installed template version | D1 `settings.template.version` | Version recorded by migrations for this site. |
| Source schema version | `src/lib/version.ts` | Latest schema expected by the current code. |
| Installed schema version | D1 `settings.schema.version` | Schema marker recorded by migrations. |
| Applied migrations | D1 `schema_migrations` | App-level migration ledger shown in `/admin/update`. |

## Safe Update Flow

1. Run the **Update CFblog from upstream** GitHub workflow, or create a branch manually.
2. Back up the production D1 database.
3. Back up important R2 objects or confirm bucket retention/versioning outside the app.
4. Review the workflow-created update PR.
5. Confirm dependencies install, tests pass, and the Worker builds.
6. Apply new migrations to a local or preview D1 database.
7. Run a Worker dry run.
8. Deploy to a preview Worker or staging environment.
9. Merge the update PR so Workers Builds deploys the Worker and the deploy script applies remote D1 migrations.
10. Open `/admin/update` and confirm the installed schema and migration list.

## Managed Update PR Flow

The recommended owner-friendly path is the committed GitHub workflow:

1. In the site owner's repository, open **Actions**.
2. Select **Update CFblog from upstream**.
3. Run the workflow with the default upstream URL.
4. Leave `target_ref` blank to use the release tag from upstream `latest.json`, or provide a specific tag, branch, or SHA.
5. Review the created PR, including `CHANGELOG.md`, `UPGRADING.md`, schema version, and listed migrations.
6. Merge the PR when checks are acceptable.

The workflow creates or updates a branch named `update/cfblog-<version>`, merges the upstream release tag, runs install/test/build, pushes the branch, and opens a PR. If there is no diff from the current site repository, it exits successfully without opening a PR.

GitHub repository settings must allow Actions to create pull requests. In GitHub, check **Settings > Actions > General > Workflow permissions** and enable the setting that allows GitHub Actions to create and approve pull requests. Organization repositories may also need the same setting enabled at the organization level.

## Git Update Flow

Add the template repository as an upstream remote once:

```sh
git remote add upstream https://github.com/your-github-user/astro-cloudflare-blog-template.git
```

This manual flow is equivalent to the workflow. Prefer release tags over `upstream/main` for reproducible updates.

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

For production, deploy after backups and preview validation:

```sh
corepack pnpm deploy
```

The default deploy uses the D1/R2 bindings in `wrangler.jsonc`; it does not require `CFBLOG_D1_DATABASE_NAME`, `CFBLOG_D1_DATABASE_ID`, or `CFBLOG_R2_BUCKET_NAME`. It publishes the Worker first so Cloudflare can link the D1 resource, then applies remote migrations before the command completes.

For an already provisioned deployment, you can list or apply remote migrations directly:

```sh
corepack pnpm db:migrations:list
corepack pnpm db:migrations:apply
```

For advanced configured deployments with pre-provisioned resources or multiple independent stacks, ensure Workers Builds or your shell defines `CFBLOG_D1_DATABASE_NAME`, `CFBLOG_D1_DATABASE_ID`, and `CFBLOG_R2_BUCKET_NAME`, then run:

```sh
corepack pnpm deploy:configured
```

The app also records its schema marker in D1 settings. If Wrangler reports no pending migration but `/admin/update` shows a pending app-level migration, inspect `schema_migrations` before deploying further changes.

## Backup And Preview Checklist

- Export or copy production D1 before applying remote migrations.
- Keep R2 object keys stable; migrations should not rename media objects without an explicit rollback plan.
- Run `corepack pnpm exec wrangler deploy --dry-run` before deploying.
- For advanced configured deployments, run `corepack pnpm wrangler:config` then `corepack pnpm exec wrangler deploy --dry-run --config wrangler.generated.jsonc`.
- Use a staging Worker and preview D1 database for risky changes.
- Confirm `/sitemap.xml`, `/rss.xml`, `/robots.txt`, `/llms.txt`, and one published post after the preview deploy.

## Optional Update Checks

Set `CFBLOG_UPDATE_CHECK_URL` to a static HTTPS URL if you want `/admin/update` to compare the deployed template version with an external latest-version marker. For the upstream template, point it at the latest GitHub Release asset:

```txt
https://github.com/McHughCyber/CFblog/releases/latest/download/latest.json
```

Set `CFBLOG_UPDATE_WORKFLOW_URL` to the site's GitHub workflow page if you want `/admin/update` to show an **Open update workflow** link. This is only a link; CFblog does not trigger GitHub Actions itself.

The URL may return plain text:

```txt
2026.05.1
```

Or JSON:

```json
{
  "version": "2026.05.1",
  "tag": "v2026.05.1",
  "releaseUrl": "https://example.com/releases/2026.05.1",
  "notes": "Short release note.",
  "schemaVersion": "0007_next_change",
  "migrations": ["0007_next_change"]
}
```

The update check is read-only. It never pulls code, applies migrations, or deploys the Worker.

## Compatibility Table

| Template version | Schema version       | Required migrations                         |
| ---------------- | -------------------- | ------------------------------------------- |
| 0.1.0            | 0006_integrations_settings | 0001 through 0006 in order.        |

## Maintainer Release Checklist

CFblog upstream releases are assigned automatically after updates land on `main` and pass CI. Versions use monthly CalVer in `YYYY.MM.N` form, where `N` resets each UTC month. Tags are the version prefixed with `v`, for example `v2026.05.1`. The npm `package.json` version is normalized without the month leading zero, for example `2026.5.1`, because npm package versions must be SemVer-compatible.

For each upstream CFblog change:

1. Merge the feature or fix PR into `main`.
2. Let the `CI` workflow pass on `main`.
3. The `Release CFblog` workflow creates a bot commit that updates `src/lib/version.ts` and `package.json`.
4. Let `CI` pass on the bot release commit.
5. The `Release CFblog` workflow creates the matching git tag, publishes a GitHub Release with generated release notes, and uploads `latest.json` as a release asset.

Only bump `SCHEMA_VERSION` when a new migration changes the expected schema. Keep `CHANGELOG.md` curated for milestone history; GitHub Releases use generated notes for per-release detail.
