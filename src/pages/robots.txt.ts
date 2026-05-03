import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/seo";

interface RuntimeEnv {
  SITE_URL: string;
}

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;

  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${absoluteUrl({
        siteUrl: runtimeEnv.SITE_URL,
        path: "/sitemap.xml"
      })}`,
      ""
    ].join("\n"),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }
  );
};
