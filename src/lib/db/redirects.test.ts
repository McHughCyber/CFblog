import { afterEach, describe, expect, it, vi } from "vitest";
import { upsertCategory } from "./categories";
import { upsertPost } from "./posts";
import type { D1Value } from "./client";

type RecordedRun = {
  query: string;
  bindings: D1Value[];
};

function createRecordingDatabase(existingRows: Record<string, unknown>) {
  const runs: RecordedRun[] = [];

  const database = {
    prepare(query: string) {
      return {
        bind(...bindings: D1Value[]) {
          return {
            async first<T>() {
              if (query.includes("FROM posts WHERE id = ?")) {
                return (existingRows[`post:${bindings[0]}`] as T | undefined) ?? null;
              }

              if (query.includes("FROM categories WHERE id = ?")) {
                return (existingRows[`category:${bindings[0]}`] as T | undefined) ?? null;
              }

              return null;
            },
            async all<T>() {
              return { results: [] as T[] };
            },
            async run() {
              runs.push({ query, bindings });
              return { success: true } as D1Result;
            }
          };
        }
      };
    }
  } as unknown as D1Database;

  return { database, runs };
}

function findRedirectRun(runs: RecordedRun[]): RecordedRun | undefined {
  return runs.find((run) => run.query.includes("INSERT INTO redirects"));
}

describe("redirect creation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a 301 redirect when a post full path changes", async () => {
    vi.spyOn(Date, "now").mockReturnValue(12345);

    const { database, runs } = createRecordingDatabase({
      "post:post-1": {
        id: "post-1",
        title: "Old title",
        slug: "old-post",
        full_path: "/old-post",
        markdown_body: "Body",
        status: "published"
      }
    });

    await upsertPost(
      database,
      {
        id: "post-1",
        title: "New title",
        slug: "new-post",
        fullPath: "/new-post",
        markdownBody: "Body",
        status: "published"
      },
      "2026-05-05T00:00:00.000Z"
    );

    expect(findRedirectRun(runs)?.bindings).toEqual([
      "redirect-post-1-12345",
      "/old-post",
      "/new-post",
      301,
      "2026-05-05T00:00:00.000Z",
      null,
      "2026-05-05T00:00:00.000Z"
    ]);
  });

  it("creates a 301 redirect when a category full path changes", async () => {
    vi.spyOn(Date, "now").mockReturnValue(67890);

    const { database, runs } = createRecordingDatabase({
      "category:cat-1": {
        id: "cat-1",
        parent_id: null,
        name: "Guides",
        slug: "guides",
        full_path: "/guides",
        sort_order: 0
      }
    });

    await upsertCategory(
      database,
      {
        id: "cat-1",
        name: "Tutorials",
        slug: "tutorials",
        fullPath: "/tutorials"
      },
      "2026-05-05T00:00:00.000Z"
    );

    expect(findRedirectRun(runs)?.bindings).toEqual([
      "redirect-cat-1-67890",
      "/guides",
      "/tutorials",
      301,
      "2026-05-05T00:00:00.000Z",
      null,
      "2026-05-05T00:00:00.000Z"
    ]);
  });
});
