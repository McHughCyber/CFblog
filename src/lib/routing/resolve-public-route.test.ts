import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePublicRoute } from "./resolve-public-route";

vi.mock("../db/posts", () => ({
  getPublishedPostByFullPath: vi.fn()
}));

vi.mock("../db/categories", () => ({
  getCategoryByFullPath: vi.fn()
}));

vi.mock("../db/redirects", () => ({
  getRedirectByFromPath: vi.fn()
}));

import { getPublishedPostByFullPath } from "../db/posts";
import { getCategoryByFullPath } from "../db/categories";
import { getRedirectByFromPath } from "../db/redirects";

const database = {} as D1Database;

describe("resolvePublicRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns post when a published post matches", async () => {
    const post = { id: "p1", full_path: "/guides/hello" };
    vi.mocked(getPublishedPostByFullPath).mockResolvedValue(post as never);
    vi.mocked(getCategoryByFullPath).mockResolvedValue(null);
    vi.mocked(getRedirectByFromPath).mockResolvedValue({
      id: "r1",
      from_path: "/guides/hello",
      to_path: "/elsewhere",
      status_code: 301,
      created_at: "2026-01-01T00:00:00.000Z"
    });

    const result = await resolvePublicRoute(database, "/guides/hello");

    expect(result).toEqual({ kind: "post", post });
    expect(getRedirectByFromPath).not.toHaveBeenCalled();
  });

  it("returns category when no post but category matches", async () => {
    const category = { id: "c1", full_path: "/guides" };
    vi.mocked(getPublishedPostByFullPath).mockResolvedValue(null);
    vi.mocked(getCategoryByFullPath).mockResolvedValue(category as never);
    vi.mocked(getRedirectByFromPath).mockResolvedValue({
      id: "r1",
      from_path: "/guides",
      to_path: "/other",
      status_code: 301,
      created_at: "2026-01-01T00:00:00.000Z"
    });

    const result = await resolvePublicRoute(database, "/guides");

    expect(result).toEqual({ kind: "category", category });
    expect(getRedirectByFromPath).not.toHaveBeenCalled();
  });

  it("returns redirect when no content matches", async () => {
    const redirect = {
      id: "r1",
      from_path: "/old-path",
      to_path: "/new-path",
      status_code: 301,
      created_at: "2026-01-01T00:00:00.000Z"
    };
    vi.mocked(getPublishedPostByFullPath).mockResolvedValue(null);
    vi.mocked(getCategoryByFullPath).mockResolvedValue(null);
    vi.mocked(getRedirectByFromPath).mockResolvedValue(redirect);

    const result = await resolvePublicRoute(database, "/old-path");

    expect(result).toEqual({ kind: "redirect", redirect });
  });

  it("returns not_found when nothing matches", async () => {
    vi.mocked(getPublishedPostByFullPath).mockResolvedValue(null);
    vi.mocked(getCategoryByFullPath).mockResolvedValue(null);
    vi.mocked(getRedirectByFromPath).mockResolvedValue(null);

    const result = await resolvePublicRoute(database, "/missing");

    expect(result).toEqual({ kind: "not_found" });
  });
});
