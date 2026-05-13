import { describe, expect, it } from "vitest";
import { latestManifestUrl, readManifestTag } from "./resolve-upstream-release.mjs";

describe("latestManifestUrl", () => {
  it("derives the latest release manifest URL from HTTPS upstream URLs", () => {
    expect(latestManifestUrl("https://github.com/McHughCyber/CFblog.git")).toBe(
      "https://github.com/McHughCyber/CFblog/releases/latest/download/latest.json"
    );
  });

  it("derives the latest release manifest URL from SSH upstream URLs", () => {
    expect(latestManifestUrl("git@github.com:McHughCyber/CFblog.git")).toBe(
      "https://github.com/McHughCyber/CFblog/releases/latest/download/latest.json"
    );
  });

  it("rejects non-GitHub URLs", () => {
    expect(() => latestManifestUrl("https://example.com/McHughCyber/CFblog.git")).toThrow(
      "github.com"
    );
  });
});

describe("readManifestTag", () => {
  it("reads CalVer release tags", () => {
    expect(readManifestTag({ tag: "v2026.05.1" })).toBe("v2026.05.1");
  });

  it("rejects missing tags", () => {
    expect(() => readManifestTag({ version: "2026.05.1" })).toThrow("must include a tag");
  });

  it("rejects malformed tags", () => {
    expect(() => readManifestTag({ tag: "v0.1.0" })).toThrow("vYYYY.MM.N");
  });
});
