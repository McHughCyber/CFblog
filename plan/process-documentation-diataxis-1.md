---
goal: Diátaxis documentation restructure for CFblog
version: 1.0
date_created: 2026-05-12
last_updated: 2026-05-12
owner: CFblog maintainers
status: Completed
tags: documentation, process, architecture
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Executable record of the documentation restructure: split the overloaded root README into Diátaxis-aligned guides under `docs/`, add a canonical configuration reference, merge Access documentation into `docs/security-and-access.md`, convert legacy filenames to redirects, and cross-link topical and upgrade docs.

## 1. Requirements and Constraints

- **REQ-001**: Root `README.md` must provide fast orientation only (what, who, architecture table, documentation map, minimal local commands, deploy pointer).
- **REQ-002**: Tutorial content must live in `docs/getting-started.md` with a single linear path.
- **REQ-003**: Deploy, operations, admin, and security narratives must live in separate how-to files under `docs/`.
- **REQ-REF-001**: Exhaustive script, binding, variable, and route tables must live only in `docs/configuration-reference.md`; other docs link there.
- **REQ-004**: `docs/access-setup.md`, `docs/cloudflare-access.md`, and `docs/ai-crawler-management.md` must remain as short redirects or be deleted after link audit; no duplicate full Access guides.
- **REQ-005**: Do not modify the Cursor-managed execution plan snapshot for this workstream (user constraint).
- **CON-001**: Documentation must match current `package.json` scripts and `wrangler.jsonc` bindings.
- **GUD-001**: Australian English spelling in prose where applicable (`behaviour`, `catalogue` sparingly).
- **SEC-001**: Do not embed real secrets or credential examples beyond placeholders in docs.

## 2. Implementation Steps

### Implementation Phase 1 — Inventory

- **GOAL-001:** Confirm routes and generator behaviour before authoring reference material.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-001 | Read `scripts/generate-wrangler-config.mjs` for required `CFBLOG_*` inputs and output merge rules. | Yes | 2026-05-12 |
| TASK-002 | Enumerate public routes from `src/pages` (`rss.xml`, `sitemap.xml`, robots/llms/crawlers endpoints, `media/[id].ts`, catch-all). | Yes | 2026-05-12 |
| TASK-003 | Confirm admin middleware paths in `src/middleware.ts` (`/admin`, `/api/admin`). | Yes | 2026-05-12 |

### Implementation Phase 2 — New documentation files

- **GOAL-002:** Add Diátaxis-aligned markdown under `docs/`.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-004 | Create `docs/configuration-reference.md` with scripts, Wrangler, bindings, vars, public and admin routes. | Yes | 2026-05-12 |
| TASK-005 | Create `docs/getting-started.md` tutorial. | Yes | 2026-05-12 |
| TASK-006 | Create `docs/deployment.md` how-to. | Yes | 2026-05-12 |
| TASK-007 | Create `docs/security-and-access.md` (Access + JWT + local bypass + CI service tokens). | Yes | 2026-05-12 |
| TASK-008 | Create `docs/operations.md` how-to. | Yes | 2026-05-12 |
| TASK-009 | Create `docs/admin-guide.md` mapped to `src/pages/admin` routes. | Yes | 2026-05-12 |

### Implementation Phase 3 — README and rewiring

- **GOAL-003:** Slim `README.md` and point all high-level navigation to `docs/`.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-010 | Replace long README with orientation + documentation table + quick local run + deploy pointer. | Yes | 2026-05-12 |

### Implementation Phase 4 — Redirects and secondary updates

- **GOAL-004:** Preserve backward-compatible paths and update internal references.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-011 | Replace `docs/access-setup.md` body with redirect to `security-and-access.md`. | Yes | 2026-05-12 |
| TASK-012 | Point `docs/cloudflare-access.md` and `docs/ai-crawler-management.md` to canonical guides. | Yes | 2026-05-12 |
| TASK-013 | Update `PROGRESS.md` and `plan/feature-astro-cloudflare-blog-template-1.md` FILE entries for doc paths. | Yes | 2026-05-12 |
| TASK-014 | Add `docs/operations.md` mention on `src/pages/admin/update/index.astro`. | Yes | 2026-05-12 |
| TASK-015 | Add documentation map lines to `UPGRADING.md`, `CHANGELOG.md`, `docs/google-integrations.md`, `docs/ai-crawlers.md`. | Yes | 2026-05-12 |

### Implementation Phase 5 — Validation

- **GOAL-005:** Verify automation and links.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-016 | Run `pnpm test` (passes in CI target Node 22+; local Node may differ for `pnpm build`). | Yes | 2026-05-12 |
| TASK-017 | Grep repository for `](docs/` and redirect targets; confirm no stale full duplicate of Access guide. | Yes | 2026-05-12 |

## 3. Alternatives

- **ALT-001:** Single `docs/README.md` hub instead of expanding root README table — rejected: GitHub default view expects root README orientation.
- **ALT-002:** Keep monolithic README and duplicate tables in guides — rejected: violates REQ-REF-001 and increases drift.

## 4. Dependencies

- **DEP-001:** Accurate alignment with `package.json` `scripts` and `wrangler.jsonc`.
- **DEP-002:** Optional Node `>=22.12.0` for local `pnpm build`; documentation content does not depend on local Node for correctness.

## 5. Files

- **FILE-001:** `README.md` — slim orientation and documentation map.
- **FILE-002:** `docs/configuration-reference.md` — new reference.
- **FILE-003:** `docs/getting-started.md` — new tutorial.
- **FILE-004:** `docs/deployment.md` — new how-to.
- **FILE-005:** `docs/security-and-access.md` — new how-to.
- **FILE-006:** `docs/operations.md` — new how-to.
- **FILE-007:** `docs/admin-guide.md` — new how-to.
- **FILE-008:** `docs/access-setup.md` — redirect stub.
- **FILE-009:** `docs/cloudflare-access.md` — redirect stub.
- **FILE-010:** `docs/ai-crawler-management.md` — redirect stub.
- **FILE-011:** `docs/google-integrations.md`, `docs/ai-crawlers.md` — See also lines.
- **FILE-012:** `UPGRADING.md`, `CHANGELOG.md` — documentation map lines.
- **FILE-013:** `PROGRESS.md`, `plan/feature-astro-cloudflare-blog-template-1.md` — traceability updates.
- **FILE-014:** `src/pages/admin/update/index.astro` — operations doc pointer.

## 6. Testing

- **TEST-001:** All relative markdown links from `README.md` and new `docs/*.md` targets exist in the repository.
- **TEST-002:** `pnpm test` completes with zero failures.
- **TEST-003:** `docs/configuration-reference.md` lists every key in `package.json` `scripts` and D1/R2 bindings from `wrangler.jsonc`.

## 7. Risks and Assumptions

- **RISK-001:** External sites may still deep-link old headings in README — mitigated by keeping upgrade changelog discoverable from README table.
- **ASSUMPTION-001:** Redirect stubs remain until external link inventory is done manually outside the repo.

## 8. Related Specifications and Further Reading

- In-repo feature specification: `plan/feature-astro-cloudflare-blog-template-1.md`.
- [Diátaxis framework](https://diataxis.fr/)
- Cloudflare Workers, D1, R2, Access, and Wrangler documentation on `https://developers.cloudflare.com/`.
