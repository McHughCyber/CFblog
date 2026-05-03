import { describe, expect, it } from "vitest";
import { buildMediaR2Key, publicPathForMediaAsset, sanitiseFileName } from "./r2-keys";

describe("sanitiseFileName", () => {
  it("strips path segments and extension", () => {
    expect(sanitiseFileName("/tmp/../Photo (1).JPEG")).toBe("photo-1");
  });

  it("falls back for empty input", () => {
    expect(sanitiseFileName("")).toBe("upload");
    expect(sanitiseFileName("!!!")).toBe("file");
  });
});

describe("buildMediaR2Key", () => {
  it("includes asset id and sanitised name", () => {
    const id = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee";
    const key = buildMediaR2Key(id, "My Shot.png");
    expect(key).toMatch(new RegExp(`^media/\\d{4}/${id}-my-shot$`));
  });
});

describe("publicPathForMediaAsset", () => {
  it("returns stable public path", () => {
    expect(publicPathForMediaAsset("abc")).toBe("/media/abc");
  });
});
