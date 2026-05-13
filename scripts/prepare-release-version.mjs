import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RELEASE_TAG_PATTERN = /^v(\d{4})\.(\d{2})\.(\d+)$/;

export function releaseMonth(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    throw new Error("release date must be a valid Date");
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

export function nextReleaseVersion(tags, date = new Date()) {
  const monthPrefix = releaseMonth(date);
  let highestSequence = 0;

  for (const tag of tags) {
    const match = RELEASE_TAG_PATTERN.exec(String(tag).trim());
    if (!match) {
      continue;
    }

    const [, year, month, sequence] = match;
    if (`${year}.${month}` !== monthPrefix) {
      continue;
    }

    highestSequence = Math.max(highestSequence, Number.parseInt(sequence, 10));
  }

  return `${monthPrefix}.${highestSequence + 1}`;
}

export function updateVersionSource(source, version) {
  if (!/^\d{4}\.\d{2}\.\d+$/.test(version)) {
    throw new Error(`release version must use YYYY.MM.N format, got ${version}`);
  }

  const updated = source.replace(
    /export const TEMPLATE_VERSION = "([^"]+)";/,
    `export const TEMPLATE_VERSION = "${version}";`
  );

  if (updated === source) {
    throw new Error("src/lib/version.ts does not contain TEMPLATE_VERSION");
  }

  return updated;
}

export function updatePackageJsonSource(source, version) {
  const packageJson = JSON.parse(source);
  packageJson.version = npmPackageVersion(version);
  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

export function npmPackageVersion(version) {
  const match = /^(\d{4})\.(\d{2})\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`release version must use YYYY.MM.N format, got ${version}`);
  }

  return `${match[1]}.${Number.parseInt(match[2], 10)}.${match[3]}`;
}

export function readGitTags(cwd = process.cwd()) {
  const output = execFileSync("git", ["tag", "--list", "v*"], {
    cwd,
    encoding: "utf8"
  });
  return output.split(/\r?\n/).filter(Boolean);
}

export function prepareReleaseVersion({
  rootDir = process.cwd(),
  tags = readGitTags(rootDir),
  date = new Date(),
  write = true
} = {}) {
  const version = nextReleaseVersion(tags, date);
  const tag = `v${version}`;
  const versionPath = path.join(rootDir, "src/lib/version.ts");
  const packagePath = path.join(rootDir, "package.json");
  const versionSource = fs.readFileSync(versionPath, "utf8");
  const packageSource = fs.readFileSync(packagePath, "utf8");
  const updatedVersionSource = updateVersionSource(versionSource, version);
  const updatedPackageSource = updatePackageJsonSource(packageSource, version);

  if (write) {
    fs.writeFileSync(versionPath, updatedVersionSource, "utf8");
    fs.writeFileSync(packagePath, updatedPackageSource, "utf8");
  }

  return { version, tag };
}

function rootFromImportMeta() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function parseDateOverride(value) {
  return value ? new Date(value) : new Date();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rootDir = process.env.CFBLOG_RELEASE_ROOT ?? rootFromImportMeta();
  const date = parseDateOverride(process.env.CFBLOG_RELEASE_DATE);
  const tags = process.env.CFBLOG_RELEASE_TAGS
    ? process.env.CFBLOG_RELEASE_TAGS.split(/\r?\n/).filter(Boolean)
    : readGitTags(rootDir);
  const result = prepareReleaseVersion({ rootDir, tags, date });

  console.log(`version=${result.version}`);
  console.log(`tag=${result.tag}`);
}
