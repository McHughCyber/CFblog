import { describe, expect, it } from "vitest";
import {
  parseImportCsvRow,
  parseSaveRedirectBody,
  parseUpdateRedirectBody,
  validateRedirectPaths
} from "./redirect-input";

describe("validateRedirectPaths", () => {
  it("normalises and lowercases from path", () => {
    const result = validateRedirectPaths("/Old-Path/", "/target/page");
    expect(result).toEqual({
      fromPath: "/old-path",
      toPath: "/target/page"
    });
  });

  it("rejects identical from and to paths", () => {
    const result = validateRedirectPaths("/same", "/same");
    expect(result).toEqual({ error: "From path and to path cannot be the same." });
  });

  it("rejects external to paths", () => {
    const result = validateRedirectPaths("/old", "https://example.com/page");
    expect(result).toEqual({ error: "To path must be an internal path starting with /." });
  });

  it("rejects javascript scheme", () => {
    const result = validateRedirectPaths("javascript:alert(1)", "/target");
    expect(result).toEqual({ error: "Paths cannot use unsafe URL schemes." });
  });
});

describe("parseSaveRedirectBody", () => {
  it("parses valid body with default status", () => {
    const result = parseSaveRedirectBody({
      fromPath: "/wp/old",
      toPath: "/guides/new",
      note: "WP import"
    });
    expect(result).toEqual({
      fromPath: "/wp/old",
      toPath: "/guides/new",
      statusCode: 301,
      note: "WP import"
    });
  });

  it("rejects invalid status code", () => {
    const result = parseSaveRedirectBody({
      fromPath: "/legacy/a",
      toPath: "/target/b",
      statusCode: 999
    });
    expect(result).toEqual({ error: "Status code must be 301, 302, 307, or 308." });
  });
});

describe("parseUpdateRedirectBody", () => {
  it("parses to path and status without from path", () => {
    const result = parseUpdateRedirectBody({
      toPath: "/new-target",
      statusCode: 302
    });
    expect(result).toEqual({
      toPath: "/new-target",
      statusCode: 302,
      note: null
    });
  });
});

describe("parseImportCsvRow", () => {
  it("skips header row", () => {
    expect(parseImportCsvRow("from_path,to_path,status_code,note", 1)).toEqual({ skip: true });
  });

  it("parses data row", () => {
    const result = parseImportCsvRow("/old,/new,301,note", 2);
    expect(result).toEqual({
      fromPath: "/old",
      toPath: "/new",
      statusCode: 301,
      note: "note"
    });
  });
});
