---
goal: Admin-managed path redirects and routing resolver for WordPress-style URL migration
version: 1.0
date_created: 2026-05-17
last_updated: 2026-05-17
owner: CFblog
status: Completed
tags: [feature, redirects, routing, wordpress, migration, admin]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Operators can manage path-based redirects from `/admin/redirects`, import legacy WordPress paths via CSV, and rely on `resolvePublicRoute` for consistent public resolution (post → category → redirect → 404). Query-string WordPress URLs (`/?p=`) are out of scope for v1.

## 1. Requirements

- **REQ-REDIR-001**: Path-based redirects stored in D1 `redirects` table.
- **REQ-REDIR-002**: Public resolution prefers live posts and categories over redirect rows.
- **REQ-REDIR-003**: Admin CRUD at `/admin/redirects` with same-origin mutation guards.
- **REQ-REDIR-004**: CSV/JSON bulk import up to 2000 rows per request.
- **REQ-REDIR-005**: Optional `note` and `updated_at` on redirect rows (migration `0007_redirect_metadata`).
- **REQ-REDIR-006**: No query-string redirect support in v1.

## 2. Implementation summary

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-101 | `src/lib/routing/resolve-public-route.ts` | Yes | 2026-05-17 |
| TASK-102 | `src/lib/routing/redirect-input.ts` validation | Yes | 2026-05-17 |
| TASK-103 | Refactor `src/pages/[...path].astro` | Yes | 2026-05-17 |
| TASK-201 | Extend `src/lib/db/redirects.ts` CRUD | Yes | 2026-05-17 |
| TASK-203 | `migrations/0007_redirect_metadata.sql` | Yes | 2026-05-17 |
| TASK-301–304 | Admin API under `/api/admin/redirects` | Yes | 2026-05-17 |
| TASK-401–405 | Admin UI pages | Yes | 2026-05-17 |
| TASK-501–502 | `docs/admin-guide.md`, `docs/configuration-reference.md` | Yes | 2026-05-17 |

## 3. Key files

- `src/lib/routing/resolve-public-route.ts` — public route resolution
- `src/lib/routing/redirect-input.ts` — path and status validation
- `src/lib/api/admin/save-redirect.ts` — create/update helpers
- `src/pages/api/admin/redirects/` — REST + import
- `src/pages/admin/redirects/` — operator UI

## 4. Deferred

- Query-string redirects (`/?p=`, `?page_id=`)
- KV cache for large redirect tables
- Multi-hop redirect chain following
