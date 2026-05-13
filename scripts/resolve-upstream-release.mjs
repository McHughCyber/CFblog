import fs from "node:fs";

const RELEASE_TAG_PATTERN = /^v\d{4}\.\d{2}\.\d+$/;

export function latestManifestUrl(upstreamUrl) {
  const trimmed = String(upstreamUrl ?? "").trim();
  if (!trimmed) {
    throw new Error("upstream_url is required");
  }

  const sshMatch = /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/.exec(trimmed);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}/${sshMatch[2]}/releases/latest/download/latest.json`;
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`upstream_url must be a GitHub repository URL, got ${trimmed}`);
  }

  if (url.hostname !== "github.com") {
    throw new Error(`upstream_url must point to github.com, got ${url.hostname}`);
  }

  const parts = url.pathname.replace(/^\/|\/$/g, "").split("/");
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(`upstream_url must include owner and repository, got ${trimmed}`);
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");
  return `https://github.com/${owner}/${repo}/releases/latest/download/latest.json`;
}

export function readManifestTag(source) {
  const manifest = typeof source === "string" ? JSON.parse(source) : source;
  const tag = typeof manifest.tag === "string" ? manifest.tag.trim() : "";

  if (!tag) {
    throw new Error("latest release manifest must include a tag");
  }

  if (!RELEASE_TAG_PATTERN.test(tag)) {
    throw new Error(`latest release manifest tag must use vYYYY.MM.N format, got ${tag}`);
  }

  return tag;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === "manifest-url") {
    process.stdout.write(latestManifestUrl(process.argv[3]));
  } else if (command === "tag") {
    process.stdout.write(readManifestTag(fs.readFileSync(process.argv[3], "utf8")));
  } else {
    throw new Error("usage: node scripts/resolve-upstream-release.mjs manifest-url <upstream-url> | tag <manifest-path>");
  }
}
