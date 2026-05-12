import { describe, expect, it } from "vitest";
import { checkLatestVersion } from "./check";

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
        new Response(JSON.stringify({ version: "9.9.9", releaseUrl: "https://example.com/releases/9.9.9" }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe("9.9.9");
    expect(result.updateAvailable).toBe(true);
    expect(result.releaseUrl).toBe("https://example.com/releases/9.9.9");
    expect(result.tag).toBeNull();
    expect(result.migrations).toEqual([]);
  });

  it("parses rich release manifests", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(
          JSON.stringify({
            version: "9.9.9",
            tag: "v9.9.9",
            releaseUrl: "https://example.com/releases/9.9.9",
            notes: "Maintenance release.",
            schemaVersion: "0007_managed_update_workflow",
            migrations: ["0007_managed_update_workflow"]
          }),
          {
            headers: { "content-type": "application/json" }
          }
        )
    );

    expect(result.latestVersion).toBe("9.9.9");
    expect(result.tag).toBe("v9.9.9");
    expect(result.updateAvailable).toBe(true);
    expect(result.releaseUrl).toBe("https://example.com/releases/9.9.9");
    expect(result.notes).toBe("Maintenance release.");
    expect(result.schemaVersion).toBe("0007_managed_update_workflow");
    expect(result.migrations).toEqual(["0007_managed_update_workflow"]);
    expect(result.error).toBeNull();
  });

  it("parses plain text version responses", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.txt",
      async () => new Response("9.9.9\n", { headers: { "content-type": "text/plain" } })
    );

    expect(result.latestVersion).toBe("9.9.9");
    expect(result.updateAvailable).toBe(true);
    expect(result.tag).toBeNull();
    expect(result.schemaVersion).toBeNull();
    expect(result.migrations).toEqual([]);
  });

  it("reports rich manifests with missing release tags", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(JSON.stringify({ version: "9.9.9", schemaVersion: "0007_managed_update_workflow" }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe("9.9.9");
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toContain("release tag");
  });

  it("reports rich manifests with invalid release tags", async () => {
    const result = await checkLatestVersion(
      "https://example.com/latest.json",
      async () =>
        new Response(JSON.stringify({ version: "9.9.9", tag: "release-9.9.9" }), {
          headers: { "content-type": "application/json" }
        })
    );

    expect(result.latestVersion).toBe("9.9.9");
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toContain("release tag");
  });
});
