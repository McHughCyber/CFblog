import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../lib/admin/mutation-request";
import { renderMarkdown } from "../../../lib/markdown/render";

interface RuntimeEnv {
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = env as RuntimeEnv;

  if (
    !isTrustedAdminMutation(request, runtimeEnv.SITE_URL, {
      allowLocalhostOrigin: runtimeEnv.ENVIRONMENT === "development"
    })
  ) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let markdown = "";
  try {
    const body = (await request.json()) as { markdown?: unknown };
    markdown = typeof body.markdown === "string" ? body.markdown : "";
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const html = await renderMarkdown(markdown);

  return new Response(JSON.stringify({ html }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
