# Security and Access

How CFblog uses **Cloudflare Access** to protect the admin surface, how JWT validation works, and how local development and CI differ from production. For environment variable tables, see [Configuration reference](configuration-reference.md). For day-two operations, see [Operations](operations.md).

## Perimeter model

CFblog treats Cloudflare Access as the **admin authentication perimeter**. Public routes can work before Access is fully configured, but **`/admin`**, **`/admin/*`**, and **`/api/admin/*`** are protected: the Worker validates the Access JWT before serving admin HTML or admin APIs.

In the Cloudflare Zero Trust dashboard, create a **self-hosted** Access application for your deployed hostname and include at least:

- `https://your-site.example.com/admin`
- `https://your-site.example.com/admin/*`
- `https://your-site.example.com/api/admin/*`

Add your identity provider and policies for users who may administer the blog. Copy the application **Audience (AUD)** tag from the Access application settings.

## Required configuration

Set these for both local trust and production Workers (production values should be **secrets**, not committed source):

```dotenv
CF_ACCESS_TEAM_DOMAIN=https://your-team.cloudflareaccess.com
CF_ACCESS_AUD=your-access-application-audience-tag
```

A **403** from `/admin` before these are set is expected. Public blog routes remain available.

## Runtime JWT validation

Cloudflare Access adds the **`Cf-Access-Jwt-Assertion`** header. CFblog validates that JWT using Cloudflare’s Access signing keys from:

```text
https://your-team.cloudflareaccess.com/cdn-cgi/access/certs
```

(substitute your real team domain).

Validation checks:

- The JWT is present.
- The signature verifies against the Access JWKS.
- The issuer matches **`CF_ACCESS_TEAM_DOMAIN`**.
- The audience matches **`CF_ACCESS_AUD`**.

Failed validation yields **403** with a clear message.

## Local development bypass

For local work only, admin routes can **skip** Access JWT checks when all of the following hold:

- Request host is **`localhost`** or **`127.0.0.1`** (port ignored).
- **`ENVIRONMENT`** is `development`, **or** Astro is running in **dev** mode (`import.meta.env.DEV`).

Any other host still requires a valid `Cf-Access-Jwt-Assertion`. **`staging`** and **`production`** environments always require normal Access validation when not on localhost.

Public routes never require Access.

## CI and machine access

The **Test deploy** job in `.github/workflows/ci.yml` deploys using **`wrangler.generated.jsonc`** and may inject `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` from GitHub Actions **variables** / **secrets** (for example `CFBLOG_AUD_TOKEN` mapped into the generated config for the test Worker).

To call **`/admin`** without an interactive browser session, CI uses **service token** headers:

- `CF-Access-Client-Id` — from secret `CFBLOG_ACCESS_CLIENT_ID`
- `CF-Access-Client-Secret` — from secret `CFBLOG_ACCESS_CLIENT_SECRET`

Cloudflare account deploy credentials use `CLOUDFLARE_ACCOUNT_ID` (variable) and `CFBLOG_CLOUDFLARE_TOKEN` (secret). Other `CFBLOG_*` names in that workflow match the advanced deploy model; see the workflow file and [Configuration reference](configuration-reference.md).

Do not copy real secret values into documentation or commits.

## Secret handling

- Keep `.env` and `.dev.vars` out of Git.
- Store production secrets in Worker secrets or your CI system.
- Rotate any credential that was exposed.
