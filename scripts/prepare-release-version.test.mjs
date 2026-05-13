import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  nextReleaseVersion,
  npmPackageVersion,
  prepareReleaseVersion,
  releaseMonth,
  updatePackageJsonSource,
  updateVersionSource
} from "./prepare-release-version.mjs";

const tempRoots = [];

function makeTempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cfblog-release-"));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, "src/lib"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "src/lib/version.ts"),
    'export const TEMPLATE_VERSION = "0.1.0";\nexport const SCHEMA_VERSION = "0006_integrations_settings";\n',
    "utf8"
  );
  fs.writeFileSync(
    path.join(root, "package.json"),
    `${JSON.stringify({ name: "cfblog-test", version: "0.1.0" }, null, 2)}\n`,
    "utf8"
  );
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("releaseMonth", () => {
  it("uses UTC year and month", () => {
    expect(releaseMonth(new Date("2026-05-13T03:48:47Z"))).toBe("2026.05");
  });
});

describe("nextReleaseVersion", () => {
  it("starts at 1 when there are no tags in the current month", () => {
    expect(nextReleaseVersion([], new Date("2026-05-13T00:00:00Z"))).toBe("2026.05.1");
  });

  it("increments the highest current-month sequence", () => {
    expect(
      nextReleaseVersion(["v2026.05.1", "v2026.05.2"], new Date("2026-05-13T00:00:00Z"))
    ).toBe("2026.05.3");
  });

  it("resets the sequence for a new month", () => {
    expect(nextReleaseVersion(["v2026.05.9"], new Date("2026-06-01T00:00:00Z"))).toBe(
      "2026.06.1"
    );
  });

  it("ignores nonmatching tags", () => {
    expect(
      nextReleaseVersion(["release-2026.05.9", "v0.1.0", "v2026.05.beta"], new Date("2026-05-13T00:00:00Z"))
    ).toBe("2026.05.1");
  });
});

describe("release source updates", () => {
  it("updates TEMPLATE_VERSION source", () => {
    expect(updateVersionSource('export const TEMPLATE_VERSION = "0.1.0";\n', "2026.05.1")).toBe(
      'export const TEMPLATE_VERSION = "2026.05.1";\n'
    );
  });

  it("updates package.json version", () => {
    expect(JSON.parse(updatePackageJsonSource('{"version":"0.1.0"}', "2026.05.1")).version).toBe(
      "2026.5.1"
    );
  });

  it("normalizes CalVer to an npm-compatible package version", () => {
    expect(npmPackageVersion("2026.05.1")).toBe("2026.5.1");
  });

  it("writes the calculated version to release files", () => {
    const rootDir = makeTempRoot();
    const result = prepareReleaseVersion({
      rootDir,
      tags: ["v2026.05.1"],
      date: new Date("2026-05-13T00:00:00Z")
    });

    expect(result).toEqual({ version: "2026.05.2", tag: "v2026.05.2" });
    expect(fs.readFileSync(path.join(rootDir, "src/lib/version.ts"), "utf8")).toContain(
      'TEMPLATE_VERSION = "2026.05.2"'
    );
    expect(JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8")).version).toBe("2026.5.2");
  });
});
