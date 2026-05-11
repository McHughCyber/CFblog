#!/usr/bin/env node
/**
 * Writes wrangler.generated.jsonc from wrangler.jsonc plus binding-related env vars.
 * Keeps worker/routing/schema settings in Git while D1/R2/KV identifiers stay per-deployer or per-instance.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseJsonc } from "jsonc-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "wrangler.jsonc");
const outPath = path.join(root, "wrangler.generated.jsonc");

function loadDotEnv(dotEnvPath) {
	if (!fs.existsSync(dotEnvPath)) return;
	const raw = fs.readFileSync(dotEnvPath, "utf8");
	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq <= 0) continue;
		const key = trimmed.slice(0, eq).trim();
		let val = trimmed.slice(eq + 1).trim();
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = val;
	}
}

loadDotEnv(path.join(root, ".env"));

const required = ["CFBLOG_D1_DATABASE_NAME", "CFBLOG_D1_DATABASE_ID", "CFBLOG_R2_BUCKET_NAME"];

for (const key of required) {
	const v = process.env[key];
	if (typeof v !== "string" || !v.trim()) {
		console.error(
			`generate-wrangler-config: missing ${key}. Set it in the shell, Workers Builds environment variables, or .env (not committed) before deploy.`
		);
		process.exit(1);
	}
}

const srcText = fs.readFileSync(srcPath, "utf8");
const parseErrors = [];
const base = parseJsonc(srcText, parseErrors, { allowTrailingComma: true });
if (!base || typeof base !== "object") {
	console.error("generate-wrangler-config: failed to parse wrangler.jsonc");
	process.exit(1);
}
if (parseErrors.length > 0) {
	console.error("generate-wrangler-config: JSONC parse issues:", parseErrors);
	process.exit(1);
}

const migrationsDir = base.d1_databases?.[0]?.migrations_dir ?? "migrations";
const workerName = process.env.CFBLOG_WORKER_NAME?.trim() || base.name;
const kvId = process.env.CFBLOG_KV_NAMESPACE_ID?.trim();
const siteUrl = process.env.CFBLOG_SITE_URL?.trim();
const environment = process.env.CFBLOG_ENVIRONMENT?.trim();

const out = {
	...base,
	name: workerName,
	d1_databases: [
		{
			binding: "CFBLOG_DB",
			database_name: process.env.CFBLOG_D1_DATABASE_NAME.trim(),
			database_id: process.env.CFBLOG_D1_DATABASE_ID.trim(),
			migrations_dir: migrationsDir
		}
	],
	r2_buckets: [
		{
			binding: "CFBLOG_MEDIA",
			bucket_name: process.env.CFBLOG_R2_BUCKET_NAME.trim()
		}
	],
	vars: {
		...base.vars,
		...(siteUrl ? { SITE_URL: siteUrl } : {}),
		...(environment ? { ENVIRONMENT: environment } : {})
	}
};

delete out.kv_namespaces;
if (kvId) {
	out.kv_namespaces = [{ binding: "CFBLOG_CACHE", id: kvId }];
}

fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`generate-wrangler-config: wrote ${path.relative(root, outPath)}`);
