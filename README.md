# CFblog

Astro blog template concept for deployment to Cloudflare Workers.

## Development Environment Variables

Local development and Wrangler deployment use dotenv-style environment variables from `.env`. The real `.env` file must stay local and must not be committed or shared with AI tooling.

Current development variables:

```dotenv
SITE_URL=http://localhost:8787
ENVIRONMENT=development

CLOUDFLARE_ACCOUNT_ID=REDACTED
CLOUDFLARE_API_KEY=REDACTED

CF_ACCESS_TEAM_DOMAIN=https://mchughcyber.cloudflareaccess.com
CF_ACCESS_AUD=REDACTED
```

Variable purpose:

| Variable | Purpose | Notes |
|---|---|---|
| `SITE_URL` | Base URL used by the app for canonical URLs, feeds, sitemap output, and local links. | Use `http://localhost:8787` for local Wrangler development. |
| `ENVIRONMENT` | Runtime environment label. | Use `development`, `staging`, or `production`. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account used by Wrangler. | Required for deployment and resource operations. |
| `CLOUDFLARE_API_KEY` | Cloudflare credential currently present in local `.env`. | Prefer `CLOUDFLARE_API_TOKEN` for Wrangler automation when possible. |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access team domain used for JWT verification. | Example format: `https://<team-name>.cloudflareaccess.com`. |
| `CF_ACCESS_AUD` | Cloudflare Access application audience tag. | Required for validating `Cf-Access-Jwt-Assertion` on admin routes. |

Recommended Wrangler authentication variable:

```dotenv
CLOUDFLARE_API_TOKEN=REDACTED
```

Wrangler supports `CLOUDFLARE_API_KEY`, but that is the older global-key style and normally pairs with `CLOUDFLARE_EMAIL`. For this project, prefer a scoped `CLOUDFLARE_API_TOKEN` with only the permissions needed for Workers, D1, R2, and related deployment resources.

## Secret Handling

- Keep `.env` out of Git.
- Keep `.env` out of AI context where possible.
- Store production secrets in Cloudflare Worker secrets or CI/CD secret storage.
- Do not place D1 database IDs, R2 bucket names, or KV namespace IDs in `.env` unless there is a specific local workflow reason; those values usually belong in `wrangler.jsonc`.
- If a Cloudflare credential is exposed, rotate it immediately in the Cloudflare dashboard.
