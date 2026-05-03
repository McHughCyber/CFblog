import type { ThemeSettings } from "./schema";

const BODY_STACK: Record<ThemeSettings["typographyPreset"], string> = {
  system:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: 'Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  newsprint:
    '"Newsreader", "Georgia", "Iowan Old Style", "Palatino Linotype", Palatino, serif'
};

export function themeToGlobalCss(theme: ThemeSettings): string {
  const body = BODY_STACK[theme.typographyPreset];
  const ui = BODY_STACK.system;
  return `:root {
  --cf-accent: ${theme.accentColor};
  --cf-bg: ${theme.backgroundColor};
  --cf-surface: ${theme.surfaceColor};
  --cf-text: ${theme.textColor};
  --cf-border: ${theme.borderColor};
  --cf-muted: ${theme.mutedTextColor};
  --cf-font-body: ${body};
  --cf-font-ui: ${ui};
  --cf-header-bg: color-mix(in srgb, ${theme.backgroundColor} 92%, ${theme.textColor});
  --cf-footer-bg: color-mix(in srgb, ${theme.backgroundColor} 88%, ${theme.textColor});
  --cf-code-bg: color-mix(in srgb, ${theme.backgroundColor} 82%, ${theme.mutedTextColor});
  color-scheme: light;
  font-family: var(--cf-font-body);
  background: var(--cf-bg);
  color: var(--cf-text);
}`;
}
