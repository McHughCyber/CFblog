# Development and Release Lifecycle

Explanation-oriented guide: how code moves from development, through validation, into an upstream CFblog release, and then into an installed site. For deployment commands, see [Deployment](deployment.md). For operator update steps, see [UPGRADING.md](../UPGRADING.md) and [Operations](operations.md).

## Who this is for

This page is for two related audiences:

- **CFblog maintainers** who change the template and publish upstream releases.
- **Site owners** who run their own CFblog repository and periodically update from upstream.

CFblog deliberately keeps source updates in GitHub. The deployed Worker can show version status and link to a workflow, but it does not pull source code, write to GitHub, or hold Cloudflare deployment credentials.

## Workflow map

| Workflow | File | Trigger | Purpose |
| --- | --- | --- | --- |
| CI | `.github/workflows/ci.yml` | Pull requests, pushes to `main` and `testing`, manual runs | Install dependencies, run tests, and build the Worker. |
| CI test deploy | `.github/workflows/ci.yml` | Pushes or manual runs on `testing` only | Deploy a configured Cloudflare test stack, apply D1 migrations, and smoke-test routes. |
| Release CFblog | `.github/workflows/release.yml` | Successful `CI` run on `main` | Prepare release metadata PRs, then tag and publish GitHub Releases. |
| Update CFblog from upstream | `.github/workflows/update-from-upstream.yml` | Manual run | Merge an upstream release into a site repository and open an update PR. |

## Maintainer flow: change to upstream release

Use this flow when developing the CFblog template itself.

1. Open a feature or fix branch.
2. Open a pull request.
3. The `CI` workflow installs dependencies, runs `pnpm test`, and runs `pnpm build`.
4. Merge the PR to `main` after review and passing checks.
5. `CI` runs again on `main`.
6. After successful `CI`, the `Release CFblog` workflow checks whether the commit is already a release commit.
7. If the commit is not yet a release commit, the workflow runs `scripts/prepare-release-version.mjs`, updates `src/lib/version.ts` and `package.json`, pushes `release/cfblog-<version>`, and opens or updates a release PR.
8. Merge the release PR after its checks pass.
9. `CI` runs again on `main`.
10. `Release CFblog` tags the validated release commit, creates or updates the GitHub Release, and uploads `latest.json`.

Versions use monthly CalVer in `YYYY.MM.N` form. Tags use the same value with a `v` prefix, for example `v2026.05.1`. The npm `package.json` value drops the leading zero from the month because npm package versions must be SemVer-compatible, for example `2026.5.1`.

`latest.json` is important because downstream site repositories use it to discover the newest release tag, schema version, and migration list.

## Site owner flow: upstream release to deployed site

Use this flow when operating a CFblog site that was created from the template.

1. In the site repository, run the **Update CFblog from upstream** workflow manually.
2. Leave `target_ref` blank to use the tag from upstream `latest.json`, or provide a specific tag, branch, or SHA.
3. The workflow creates or updates `update/cfblog-<version>`.
4. The workflow merges the upstream release commit into that branch.
5. The workflow runs dependency install, tests, and build.
6. If there are changes, the workflow pushes the branch and opens or updates an update PR.
7. Review the PR, especially `CHANGELOG.md`, `UPGRADING.md`, `src/lib/version.ts`, and any new migrations.
8. Back up production D1 and important R2 objects before applying migrations.
9. Validate with local or preview D1 migrations and, for higher-risk changes, a staging Worker.
10. Merge the update PR.
11. Let Cloudflare Workers Builds or your deployment process run the deploy command.
12. Confirm `/admin/update`, public routes, and migration status after deployment.

The update workflow prepares the Git branch and PR. It does not deploy production by itself. Production deployment is handled by Cloudflare Workers Builds, the Deploy to Cloudflare flow, or your own `pnpm deploy` / `pnpm deploy:configured` process.

## What gets deployed

The application deploy target is Cloudflare Workers, not Cloudflare Pages. Runtime data is split across:

- **D1** for structured blog content, settings, revisions, redirects, and migration state.
- **R2** for uploaded files.
- **Cloudflare Access** for deployed admin authentication.
- Optional **KV** only for advanced cache use.

The default deploy command is `pnpm deploy`. It builds the Worker, deploys it with `wrangler deploy`, and then applies remote D1 migrations through `pnpm db:migrations:apply`.

Advanced deployments can use `pnpm deploy:configured`, which generates `wrangler.generated.jsonc` from `CFBLOG_*` variables and deploys against pre-provisioned D1/R2 resources.

## Branch roles

| Branch | Role |
| --- | --- |
| Feature branches | Normal development and pull requests. |
| `testing` | Optional configured Cloudflare test deployment through `CI`. |
| `main` | Validated integration branch and source for upstream releases. |
| `release/cfblog-<version>` | Automated release metadata PR branch created by `Release CFblog`. |
| `update/cfblog-<version>` | Automated downstream update PR branch created by `Update CFblog from upstream`. |

## Important boundaries

- The Worker does not self-update source code.
- `/admin/update` is informational. It can show version metadata and a link to the GitHub workflow, but it does not trigger Actions.
- The update workflow does not apply production migrations unless your deployment process runs afterward.
- Production D1 and R2 backups are operator responsibilities before risky updates.
- `SCHEMA_VERSION` should change only when a migration changes the expected application schema.
