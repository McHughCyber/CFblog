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
  });
});
