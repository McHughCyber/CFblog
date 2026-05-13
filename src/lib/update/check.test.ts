import { describe, expect, it } from "vitest";
import { TEMPLATE_VERSION } from "../version";
import { checkLatestVersion } from "./check";

const NEWER_FIXTURE_VERSION = "9999.12.1";
const NEWER_FIXTURE_TAG = `v${NEWER_FIXTURE_VERSION}`;
const NEWER_FIXTURE_RELEASE_URL = `https://example.com/releases/${NEWER_FIXTURE_VERSION}`;

describe("checkLatestVersion", () => {
  it("reports unconfigured update checks", async () => {
    const result = await checkLatestVersion(null);
    expect(result.error).toContain("not configured");
    expect(result.updateAvailable).toBe(false);
  });

  it("parses JSON version responses", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(JSON.stringify({ version: NEWER_FIXTURE_VERSION, releaseUrl: NEWER_FIXTURE_RELEASE_URL }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe(NEWER_FIXTURE_VERSION);
    expect(result.updateAvailable).toBe(true);
    expect(result.releaseUrl).toBe(NEWER_FIXTURE_RELEASE_URL);
    expect(result.tag).toBeNull();
    expect(result.migrations).toEqual([]);
  });

  it("parses rich release manifests", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(
          JSON.stringify({
            version: NEWER_FIXTURE_VERSION,
            tag: NEWER_FIXTURE_TAG,
            releaseUrl: NEWER_FIXTURE_RELEASE_URL,
            notes: "Maintenance release.",
            schemaVersion: "0007_managed_update_workflow",
            migrations: ["0007_managed_update_workflow"]
          }),
          {
            headers: { "content-type": "application/json" }
          }
        )
    );

    expect(result.latestVersion).toBe(NEWER_FIXTURE_VERSION);
    expect(result.tag).toBe(NEWER_FIXTURE_TAG);
    expect(result.updateAvailable).toBe(true);
    expect(result.releaseUrl).toBe(NEWER_FIXTURE_RELEASE_URL);
    expect(result.notes).toBe("Maintenance release.");
    expect(result.schemaVersion).toBe("0007_managed_update_workflow");
    expect(result.migrations).toEqual(["0007_managed_update_workflow"]);
    expect(result.error).toBeNull();
  });

  it("parses plain text version responses", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.txt",
      async () => new Response(`${NEWER_FIXTURE_VERSION}\n`, { headers: { "content-type": "text/plain" } })
    );

    expect(result.latestVersion).toBe(NEWER_FIXTURE_VERSION);
    expect(result.updateAvailable).toBe(true);
    expect(result.tag).toBeNull();
    expect(result.schemaVersion).toBeNull();
    expect(result.migrations).toEqual([]);
  });

  it("does not report an update when the latest version matches the installed version", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(JSON.stringify({ version: TEMPLATE_VERSION }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe(TEMPLATE_VERSION);
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toBeNull();
  });

  it("reports rich manifests with missing release tags", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(JSON.stringify({ version: NEWER_FIXTURE_VERSION, schemaVersion: "0007_managed_update_workflow" }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe(NEWER_FIXTURE_VERSION);
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toContain("release tag");
  });

  it("reports rich manifests with invalid release tags", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(JSON.stringify({ version: NEWER_FIXTURE_VERSION, tag: "v0.1.0" }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe(NEWER_FIXTURE_VERSION);
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toContain("release tag");
  });
});
