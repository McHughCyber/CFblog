import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey
} from "jose";

export const accessJwtHeaderName = "cf-access-jwt-assertion";

export interface AccessConfig {
  teamDomain?: string;
  audience?: string;
}

export interface AccessBypassEnv {
  ENVIRONMENT?: string;
}

export interface AccessUser {
  email: string | null;
  payload: JWTPayload;
}

export interface ValidateAccessOptions {
  jwks?: JWTVerifyGetKey;
}

export class AccessAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessAuthError";
  }
}

export function normalizeTeamDomain(teamDomain: string): string {
  return teamDomain.replace(/\/+$/, "");
}

export function getAccessConfig(env: {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}): AccessConfig {
  return {
    teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
    audience: env.CF_ACCESS_AUD
  };
}

export function getAccessToken(request: Request): string | null {
  return request.headers.get(accessJwtHeaderName);
}

function stripPortFromHost(rawHost: string): string {
  const host = rawHost.trim().toLowerCase();
  if (!host) {
    return host;
  }

  // IPv6 hosts are not expected in this project for local bypass,
  // but keep bracket handling predictable for fail-closed checks.
  if (host.startsWith("[") && host.endsWith("]")) {
    return host.slice(1, -1);
  }

  const lastColonIndex = host.lastIndexOf(":");
  if (lastColonIndex === -1) {
    return host;
  }

  return host.slice(0, lastColonIndex);
}

export function getRequestHostname(request: Request): string {
  const hostHeader = request.headers.get("host");
  if (hostHeader) {
    return stripPortFromHost(hostHeader);
  }

  try {
    return new URL(request.url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isLocalDevelopmentBypassAllowed(
  request: Request,
  env: AccessBypassEnv,
  options: { astroDevMode?: boolean } = {}
): boolean {
  const isDevelopmentEnv = env.ENVIRONMENT === "development";
  if (!isDevelopmentEnv && !options.astroDevMode) {
    return false;
  }

  const hostname = getRequestHostname(request);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export async function validateAccessRequest(
  request: Request,
  config: AccessConfig,
  options: ValidateAccessOptions = {}
): Promise<AccessUser> {
  if (!config.teamDomain) {
    throw new AccessAuthError("Missing Cloudflare Access team domain.");
  }

  if (!config.audience) {
    throw new AccessAuthError("Missing Cloudflare Access audience.");
  }

  const token = getAccessToken(request);

  if (!token) {
    throw new AccessAuthError("Missing Cloudflare Access JWT.");
  }

  const teamDomain = normalizeTeamDomain(config.teamDomain);
  const jwks =
    options.jwks ??
    createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: teamDomain,
    audience: config.audience
  });

  return {
    email:
      typeof payload.email === "string"
        ? payload.email
        : typeof payload.sub === "string"
          ? payload.sub
          : null,
    payload
  };
}

export function forbidden(message = "Forbidden"): Response {
  return new Response(message, {
    status: 403,
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
