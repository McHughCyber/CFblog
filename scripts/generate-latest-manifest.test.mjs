import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildLatestManifest,
  generateLatestManifest,
  migrationNames,
  readVersionConstants
} from "./generate-latest-manifest.mjs";

const tempRoots = [];

function makeTempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cfblog-manifest-"));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, "src/lib"), { recursive: true });
  fs.mkdirSync(path.join(root, "migrations"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "src/lib/version.ts"),
    'export const TEMPLATE_VERSION = "2026.05.1";\nexport const SCHEMA_VERSION = "0006_integrations_settings";\n',
    "utf8"
  );
  fs.writeFileSync(path.join(root, "migrations/0002_seed_defaults.sql"), "", "utf8");
  fs.writeFileSync(path.join(root, "migrations/0001_initial_schema.sql"), "", "utf8");
  fs.writeFileSync(path.join(root, "migrations/README.md"), "", "utf8");
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("readVersionConstants", () => {
  it("reads template and schema version constants", () => {
    expect(
      readVersionConstants(
        'export const TEMPLATE_VERSION = "2026.05.1";\nexport const SCHEMA_VERSION = "0006_integrations_settings";\n'
      )
    ).toEqual({
      templateVersion: "2026.05.1",
      schemaVersion: "0006_integrations_settings"
    });
  });
});

describe("migrationNames", () => {
  it("returns sorted SQL migration names without extensions", () => {
    expect(migrationNames(["0002_seed_defaults.sql", "notes.txt", "0001_initial_schema.sql"])).toEqual([
      "0001_initial_schema",
      "0002_seed_defaults"
    ]);
  });
});

describe("buildLatestManifest", () => {
  it("builds CalVer release metadata", () => {
    expect(
      buildLatestManifest({
        version: "2026.05.1",
        schemaVersion: "0006_integrations_settings",
        migrations: ["0001_initial_schema"],
        repository: "McHughCyber/CFblog",
        notes: "Generated notes."
      })
    ).toEqual({
      version: "2026.05.1",
      tag: "v2026.05.1",
      releaseUrl: "https://github.com/McHughCyber/CFblog/releases/tag/v2026.05.1",
      notes: "Generated notes.",
      schemaVersion: "0006_integrations_settings",
      migrations: ["0001_initial_schema"]
    });
  });
});

describe("generateLatestManifest", () => {
  it("writes latest.json with version, tag, release URL, schema, and migrations", () => {
    const rootDir = makeTempRoot();
    const writePath = path.join(rootDir, "latest.json");
    const result = generateLatestManifest({
      rootDir,
      repository: "McHughCyber/CFblog",
      writePath
    });

    expect(result.manifest.version).toBe("2026.05.1");
    expect(result.manifest.tag).toBe("v2026.05.1");
    expect(result.manifest.releaseUrl).toBe("https://github.com/McHughCyber/CFblog/releases/tag/v2026.05.1");
    expect(result.manifest.schemaVersion).toBe("0006_integrations_settings");
    expect(result.manifest.migrations).toEqual(["0001_initial_schema", "0002_seed_defaults"]);
    expect(JSON.parse(fs.readFileSync(writePath, "utf8"))).toEqual(result.manifest);
  });
});
