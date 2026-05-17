import {
  checkRedirectTargetExists,
  parseSaveRedirectBody,
  parseUpdateRedirectBody,
  type ParsedRedirectInput,
  type SaveRedirectBody
} from "../../routing/redirect-input";
import {
  createRedirect,
  getRedirectByFromPath,
  getRedirectById,
  updateRedirect
} from "../../db/redirects";
import type { RedirectRecord } from "../../db/types";
import { isTrustedAdminMutation } from "../../admin/mutation-request";

export type { SaveRedirectBody, ParsedRedirectInput };

export interface ApplyRedirectSaveInput {
  id?: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  note?: string | null;
}

export interface SaveRedirectContext {
  database: D1Database;
  siteUrl: string;
  request: Request;
  allowLocalhostOrigin?: boolean;
}

export type SaveRedirectResult =
  | { ok: true; redirect: RedirectRecord; warning?: string }
  | { ok: false; status: number; message: string };

export async function applyRedirectCreate(
  ctx: SaveRedirectContext,
  parsed: ParsedRedirectInput
): Promise<SaveRedirectResult> {
  if (
    !isTrustedAdminMutation(ctx.request, ctx.siteUrl, {
      allowLocalhostOrigin: ctx.allowLocalhostOrigin
    })
  ) {
    return {
      ok: false,
      status: 403,
      message: "Cross-origin requests are not allowed for this action."
    };
  }

  const existing = await getRedirectByFromPath(ctx.database, parsed.fromPath);
  const id = existing?.id ?? crypto.randomUUID();

  await createRedirect(ctx.database, {
    id,
    fromPath: parsed.fromPath,
    toPath: parsed.toPath,
    statusCode: parsed.statusCode,
    note: parsed.note
  });

  const redirect = await getRedirectByFromPath(ctx.database, parsed.fromPath);
  if (!redirect) {
    return { ok: false, status: 500, message: "Redirect could not be saved." };
  }

  const targetCheck = await checkRedirectTargetExists(ctx.database, parsed.toPath);

  return {
    ok: true,
    redirect,
    warning: targetCheck?.warning
  };
}

export async function applyRedirectUpdate(
  ctx: SaveRedirectContext,
  id: string,
  parsed: { toPath: string; statusCode: 301 | 302 | 307 | 308; note: string | null }
): Promise<SaveRedirectResult> {
  if (
    !isTrustedAdminMutation(ctx.request, ctx.siteUrl, {
      allowLocalhostOrigin: ctx.allowLocalhostOrigin
    })
  ) {
    return {
      ok: false,
      status: 403,
      message: "Cross-origin requests are not allowed for this action."
    };
  }

  const existing = await getRedirectById(ctx.database, id);
  if (!existing) {
    return { ok: false, status: 404, message: "Redirect not found." };
  }

  if (existing.from_path === parsed.toPath) {
    return { ok: false, status: 400, message: "From path and to path cannot be the same." };
  }

  await updateRedirect(ctx.database, id, {
    toPath: parsed.toPath,
    statusCode: parsed.statusCode,
    note: parsed.note
  });

  const redirect = await getRedirectById(ctx.database, id);
  if (!redirect) {
    return { ok: false, status: 500, message: "Redirect could not be updated." };
  }

  const targetCheck = await checkRedirectTargetExists(ctx.database, parsed.toPath);

  return {
    ok: true,
    redirect,
    warning: targetCheck?.warning
  };
}

export { parseSaveRedirectBody, parseUpdateRedirectBody };
