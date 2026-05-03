import { describe, expect, it } from "vitest";
import { createPagination, pageHref, parsePage } from "./pagination";

describe("pagination helpers", () => {
  it("parses invalid page values as page one", () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage("nope")).toBe(1);
    expect(parsePage("-2")).toBe(1);
  });

  it("bounds pagination to the available page range", () => {
    expect(createPagination(21, 9, 10)).toMatchObject({
      currentPage: 3,
      totalPages: 3,
      offset: 20,
      hasPreviousPage: true,
      hasNextPage: false
    });
  });

  it("omits the page query for the first page", () => {
    expect(pageHref("/notes", 1)).toBe("/notes");
    expect(pageHref("/notes", 3)).toBe("/notes?page=3");
  });
});
