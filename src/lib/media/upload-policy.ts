/**
 * SVG uploads are rejected for MVP: inline SVG in Markdown can execute script
 * when rendered without strict CSP. Revisit only with explicit sanitisation.
 */
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif"
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function isAllowedImageMimeType(mime: string): boolean {
  const normalised = mime.trim().toLowerCase();
  return ALLOWED_IMAGE_MIME_TYPES.has(normalised);
}

export function validateUploadSize(byteLength: number): string | null {
  if (byteLength <= 0) {
    return "Empty file.";
  }
  if (byteLength > MAX_UPLOAD_BYTES) {
    return `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB).`;
  }
  return null;
}
