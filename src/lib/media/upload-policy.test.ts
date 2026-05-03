import { describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  isAllowedImageMimeType,
  validateUploadSize
} from "./upload-policy";

describe("isAllowedImageMimeType", () => {
  it("accepts common raster types", () => {
    for (const t of ALLOWED_IMAGE_MIME_TYPES) {
      expect(isAllowedImageMimeType(t)).toBe(true);
      expect(isAllowedImageMimeType(t.toUpperCase())).toBe(true);
    }
  });

  it("rejects SVG", () => {
    expect(isAllowedImageMimeType("image/svg+xml")).toBe(false);
  });
});

describe("validateUploadSize", () => {
  it("rejects empty and oversize", () => {
    expect(validateUploadSize(0)).toMatch(/empty/i);
    expect(validateUploadSize(9 * 1024 * 1024)).toMatch(/large/i);
    expect(validateUploadSize(100)).toBeNull();
  });
});
