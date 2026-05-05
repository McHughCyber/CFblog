# Cloudflare Access Setup

CFblog treats Cloudflare Access as the admin authentication perimeter. The app still validates the Access JWT inside the Worker before rendering `/admin/*` or `/api/admin/*`.

## Create the Access Application

1. In Cloudflare Zero Trust, create a self-hosted Access application for your deployed CFblog hostname.
2. Protect the admin surface, for example:
   - `https://your-site.example.com/admin`
   - `https://your-site.example.com/admin/*`
   - `https://your-site.example.com/api/admin/*`
3. Add the identity provider and policy rules for the users who can administer the blog.
4. Copy the Application Audience (AUD) tag from the Access application settings.

## Configure Environment Values

Set these values for local development and Worker deployment:

```dotenv
CF_ACCESS_TEAM_DOMAIN=https://your-team.cloudflareaccess.com
CF_ACCESS_AUD=your-access-application-audience-tag
```

For production, store these as Worker environment variables or CI/CD secrets. Do not hard-code Access values into source files.

## Runtime Validation

Cloudflare Access adds the `Cf-Access-Jwt-Assertion` request header. CFblog validates that JWT with Cloudflare's Access signing keys from:

```text
https://your-team.cloudflareaccess.com/cdn-cgi/access/certs
```

The validation checks:

- The JWT exists.
- The token signature verifies against the Access JWKS.
- The issuer matches `CF_ACCESS_TEAM_DOMAIN`.
- The audience matches `CF_ACCESS_AUD`.

Requests that fail validation return `403`.

## Local Development Note

CFblog includes a development-only bypass for admin authentication during local work.

- The bypass only applies when the request host resolves to `localhost` or `127.0.0.1` (port is ignored).
- The bypass only applies when `ENVIRONMENT=development` or Astro is running in dev mode.
- All non-local hosts still require a valid `Cf-Access-Jwt-Assertion` token.
- Deployed environments (`staging`/`production`) remain fail-closed and require normal Cloudflare Access JWT validation.

Public routes remain available without Access.
