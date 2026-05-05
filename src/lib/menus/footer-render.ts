import type { ResolvedMenuNode } from "./resolve";

export interface FooterRenderModel {
  showNav: boolean;
  fallbackText: string;
}

export function buildFooterRenderModel(
  footerNav: ResolvedMenuNode[],
  siteTitle: string,
  year = new Date().getFullYear()
): FooterRenderModel {
  const trimmedTitle = siteTitle.trim();
  const fallbackTitle = trimmedTitle.length > 0 ? trimmedTitle : "CFblog";

  return {
    showNav: footerNav.length > 0,
    fallbackText: `${fallbackTitle} © ${year}`
  };
}
