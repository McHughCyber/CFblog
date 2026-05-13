import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function readVersionConstants(source) {
  const templateMatch = /export const TEMPLATE_VERSION = "([^"]+)";/.exec(source);
  const schemaMatch = /export const SCHEMA_VERSION = "([^"]+)";/.exec(source);

  if (!templateMatch) {
    throw new Error("src/lib/version.ts does not contain TEMPLATE_VERSION");
  }

  if (!schemaMatch) {
    throw new Error("src/lib/version.ts does not contain SCHEMA_VERSION");
  }

  return {
    templateVersion: templateMatch[1],
    schemaVersion: schemaMatch[1]
  };
}

export function migrationNames(entries) {
  return entries
    .filter((entry) => entry.endsWith(".sql"))
    .map((entry) => entry.replace(/\.sql$/, ""))
    .sort((a, b) => a.localeCompare(b));
}

export function buildLatestManifest({ version, schemaVersion, migrations, repository, notes = "" }) {
  if (!/^\d{4}\.\d{2}\.\d+$/.test(version)) {
    throw new Error(`release version must use YYYY.MM.N format, got ${version}`);
  }

  if (!repository || !/^[^/\s]+\/[^/\s]+$/.test(repository)) {
    throw new Error("repository must use owner/name format");
  }

  const tag = `v${version}`;
  return {
    version,
    tag,
    releaseUrl: `https://github.com/${repository}/releases/tag/${tag}`,
    notes,
    schemaVersion,
    migrations
  };
}

export function generateLatestManifest({
  rootDir = process.cwd(),
  repository,
  notes = "See the GitHub release notes for this CFblog release.",
  writePath
} = {}) {
  const versionPath = path.join(rootDir, "src/lib/version.ts");
  const migrationsPath = path.join(rootDir, "migrations");
  const versions = readVersionConstants(fs.readFileSync(versionPath, "utf8"));
  const manifest = buildLatestManifest({
    version: versions.templateVersion,
    schemaVersion: versions.schemaVersion,
    migrations: migrationNames(fs.readdirSync(migrationsPath)),
    repository,
    notes
  });
  const output = `${JSON.stringify(manifest, null, 2)}\n`;

  if (writePath) {
    fs.writeFileSync(writePath, output, "utf8");
  }

  return { manifest, output };
}

function rootFromImportMeta() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rootDir = process.env.CFBLOG_RELEASE_ROOT ?? rootFromImportMeta();
  const repository = process.env.CFBLOG_RELEASE_REPOSITORY ?? process.env.GITHUB_REPOSITORY;
  const writePath = process.argv[2] ?? "latest.json";
  generateLatestManifest({ rootDir, repository, writePath });
}
