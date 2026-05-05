import { describe, expect, it } from "vitest";
import { D1QueryError, all } from "./client";

function createFailingDatabase(error: Error): D1Database {
  return {
    prepare() {
      return {
        bind() {
          return {
            async all() {
              throw error;
            }
          };
        }
      };
    }
  } as unknown as D1Database;
}

describe("D1 client helpers", () => {
  it("adds query context to D1 failures", async () => {
    const cause = new Error("D1_ERROR: no such table: posts");
    const database = createFailingDatabase(cause);

    await expect(
      all(database, "SELECT status, COUNT(*) AS total FROM posts GROUP BY status")
    ).rejects.toMatchObject({
      name: "D1QueryError",
      message:
        "D1 query failed: SELECT status, COUNT(*) AS total FROM posts GROUP BY status",
      cause
    } satisfies Partial<D1QueryError>);
  });
});
