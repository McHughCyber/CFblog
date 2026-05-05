import {
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair
} from "jose";
import { describe, expect, it } from "vitest";
import {
  AccessAuthError,
  getAccessConfig,
  getRequestHostname,
  getAccessToken,
  isLocalDevelopmentBypassAllowed,
  normalizeTeamDomain,
  validateAccessRequest
} from "./access";

describe("Cloudflare Access helpers", () => {
  it("normalizes the team domain", () => {
    expect(
      normalizeTeamDomain("https://example.cloudflareaccess.com/")
    ).toBe("https://example.cloudflareaccess.com");
  });

  it("reads Access configuration from env-shaped values", () => {
    expect(
      getAccessConfig({
        CF_ACCESS_TEAM_DOMAIN: "https://example.cloudflareaccess.com",
        CF_ACCESS_AUD: "audience"
      })
    ).toEqual({
      teamDomain: "https://example.cloudflareaccess.com",
      audience: "audience"
    });
  });

  it("reads the Access assertion header case-insensitively", () => {
    const request = new Request("https://example.com/admin", {
      headers: {
        "Cf-Access-Jwt-Assertion": "token"
      }
    });

    expect(getAccessToken(request)).toBe("token");
  });

  it("extracts request hostname from Host header and strips port", () => {
    const request = new Request("https://example.com/admin", {
      headers: {
        Host: "localhost:8787"
      }
    });

    expect(getRequestHostname(request)).toBe("localhost");
  });

  it("allows bypass for localhost in development environment", () => {
    const request = new Request("http://localhost:8787/admin", {
      headers: {
        Host: "localhost:8787"
      }
    });

    expect(
      isLocalDevelopmentBypassAllowed(request, {
        ENVIRONMENT: "development"
      })
    ).toBe(true);
  });

  it("allows bypass for 127.0.0.1 in Astro dev mode", () => {
    const request = new Request("http://127.0.0.1:8787/admin", {
      headers: {
        Host: "127.0.0.1:8787"
      }
    });

    expect(
      isLocalDevelopmentBypassAllowed(
        request,
        {
          ENVIRONMENT: "staging"
        },
        { astroDevMode: true }
      )
    ).toBe(true);
  });

  it("does not allow bypass for non-local hosts in development", () => {
    const request = new Request("https://example.com/admin", {
      headers: {
        Host: "example.com"
      }
    });

    expect(
      isLocalDevelopmentBypassAllowed(request, {
        ENVIRONMENT: "development"
      })
    ).toBe(false);
  });

  it("does not allow bypass on localhost outside development", () => {
    const request = new Request("http://localhost:8787/admin", {
      headers: {
        Host: "localhost:8787"
      }
    });

    expect(
      isLocalDevelopmentBypassAllowed(request, {
        ENVIRONMENT: "production"
      })
    ).toBe(false);
  });

  it("fails closed when required config or token values are missing", async () => {
    const request = new Request("https://example.com/admin");

    await expect(validateAccessRequest(request, {})).rejects.toBeInstanceOf(
      AccessAuthError
    );
    await expect(
      validateAccessRequest(request, {
        teamDomain: "https://example.cloudflareaccess.com"
      })
    ).rejects.toBeInstanceOf(AccessAuthError);
    await expect(
      validateAccessRequest(request, {
        teamDomain: "https://example.cloudflareaccess.com",
        audience: "audience"
      })
    ).rejects.toBeInstanceOf(AccessAuthError);
  });

  it("validates a signed Access JWT against issuer and audience", async () => {
    const issuer = "https://example.cloudflareaccess.com";
    const audience = "audience";
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const publicJwk = await exportJWK(publicKey);
    const jwks = createLocalJWKSet({
      keys: [
        {
          ...publicJwk,
          kid: "test-key",
          alg: "RS256",
          use: "sig"
        }
      ]
    });
    const token = await new SignJWT({
      email: "admin@example.com"
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject("user-id")
      .setExpirationTime("5 minutes")
      .sign(privateKey);
    const request = new Request("https://example.com/admin", {
      headers: {
        "Cf-Access-Jwt-Assertion": token
      }
    });

    await expect(
      validateAccessRequest(
        request,
        {
          teamDomain: issuer,
          audience
        },
        { jwks }
      )
    ).resolves.toMatchObject({
      email: "admin@example.com"
    });
  });

  it("rejects a signed Access JWT with the wrong audience", async () => {
    const issuer = "https://example.cloudflareaccess.com";
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const publicJwk = await exportJWK(publicKey);
    const jwks = createLocalJWKSet({
      keys: [
        {
          ...publicJwk,
          kid: "test-key",
          alg: "RS256",
          use: "sig"
        }
      ]
    });
    const token = await new SignJWT({
      email: "admin@example.com"
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(issuer)
      .setAudience("other-audience")
      .setExpirationTime("5 minutes")
      .sign(privateKey);
    const request = new Request("https://example.com/admin", {
      headers: {
        "Cf-Access-Jwt-Assertion": token
      }
    });

    await expect(
      validateAccessRequest(
        request,
        {
          teamDomain: issuer,
          audience: "audience"
        },
        { jwks }
      )
    ).rejects.toThrow();
  });
});
