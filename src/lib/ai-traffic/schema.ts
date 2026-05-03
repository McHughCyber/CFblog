export const AI_TRAFFIC_SETTING_KEY = "aiTraffic";

export type AiRobotsPolicy = "allow" | "disallow-ai";

export interface AiTrafficSettings {
  siteDescription: string;
  robotsPolicy: AiRobotsPolicy;
  aiUserAgents: string[];
  llmsTxtEnabled: boolean;
  llmsFullTxtEnabled: boolean;
  crawlersJsonEnabled: boolean;
  contactUrl: string | null;
  contentLicenseUrl: string | null;
}

export type AiTrafficPatch = Partial<AiTrafficSettings>;

export const DEFAULT_AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot"
];

export const DEFAULT_AI_TRAFFIC: AiTrafficSettings = {
  siteDescription: "A Cloudflare-native Astro blog.",
  robotsPolicy: "allow",
  aiUserAgents: DEFAULT_AI_USER_AGENTS,
  llmsTxtEnabled: true,
  llmsFullTxtEnabled: true,
  crawlersJsonEnabled: true,
  contactUrl: null,
  contentLicenseUrl: null
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asOptionalUrl(value: unknown): string | null {
  const maybeString = asNonEmptyString(value);
  if (!maybeString) {
    return null;
  }

  try {
    const url = new URL(maybeString);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normaliseUserAgents(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return DEFAULT_AI_USER_AGENTS;
  }

  const seen = new Set<string>();
  const agents = value
    .map((item) => asNonEmptyString(item))
    .filter((item): item is string => item != null)
    .map((item) => item.slice(0, 80))
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  return agents.length > 0 ? agents : DEFAULT_AI_USER_AGENTS;
}

export function normaliseAiTrafficSettings(raw: unknown): AiTrafficSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_AI_TRAFFIC };
  }

  const input = raw as Partial<AiTrafficSettings>;
  const robotsPolicy: AiRobotsPolicy =
    input.robotsPolicy === "disallow-ai" ? "disallow-ai" : "allow";

  return {
    siteDescription:
      asNonEmptyString(input.siteDescription) ?? DEFAULT_AI_TRAFFIC.siteDescription,
    robotsPolicy,
    aiUserAgents: normaliseUserAgents(input.aiUserAgents),
    llmsTxtEnabled:
      typeof input.llmsTxtEnabled === "boolean"
        ? input.llmsTxtEnabled
        : DEFAULT_AI_TRAFFIC.llmsTxtEnabled,
    llmsFullTxtEnabled:
      typeof input.llmsFullTxtEnabled === "boolean"
        ? input.llmsFullTxtEnabled
        : DEFAULT_AI_TRAFFIC.llmsFullTxtEnabled,
    crawlersJsonEnabled:
      typeof input.crawlersJsonEnabled === "boolean"
        ? input.crawlersJsonEnabled
        : DEFAULT_AI_TRAFFIC.crawlersJsonEnabled,
    contactUrl: asOptionalUrl(input.contactUrl),
    contentLicenseUrl: asOptionalUrl(input.contentLicenseUrl)
  };
}

export function mergeAiTrafficSettings(
  current: AiTrafficSettings,
  patch: AiTrafficPatch
): AiTrafficSettings {
  return normaliseAiTrafficSettings({ ...current, ...patch });
}

export function parseAiTrafficPatch(raw: unknown): { ok: true; patch: AiTrafficPatch } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Expected a JSON object." };
  }

  const input = raw as Record<string, unknown>;
  const patch: AiTrafficPatch = {};

  if ("siteDescription" in input) {
    const value = asNonEmptyString(input.siteDescription);
    if (!value) {
      return { ok: false, error: "AI-facing site description is required." };
    }
    patch.siteDescription = value.slice(0, 500);
  }

  if ("robotsPolicy" in input) {
    if (input.robotsPolicy !== "allow" && input.robotsPolicy !== "disallow-ai") {
      return { ok: false, error: "Robots policy must be allow or disallow-ai." };
    }
    patch.robotsPolicy = input.robotsPolicy;
  }

  if ("aiUserAgents" in input) {
    const agents = normaliseUserAgents(input.aiUserAgents);
    if (agents.length === 0) {
      return { ok: false, error: "At least one AI crawler user agent is required." };
    }
    patch.aiUserAgents = agents;
  }

  for (const key of ["llmsTxtEnabled", "llmsFullTxtEnabled", "crawlersJsonEnabled"] as const) {
    if (key in input) {
      if (typeof input[key] !== "boolean") {
        return { ok: false, error: `${key} must be a boolean.` };
      }
      patch[key] = input[key];
    }
  }

  for (const key of ["contactUrl", "contentLicenseUrl"] as const) {
    if (key in input) {
      if (input[key] == null || input[key] === "") {
        patch[key] = null;
        continue;
      }
      const value = asOptionalUrl(input[key]);
      if (!value) {
        return { ok: false, error: `${key} must be an absolute HTTP(S) URL.` };
      }
      patch[key] = value;
    }
  }

  return { ok: true, patch };
}
