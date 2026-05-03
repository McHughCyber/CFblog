export interface Pagination {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  offset: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function createPagination(
  totalItems: number,
  currentPage: number,
  perPage: number
): Pagination {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const boundedPage = Math.min(Math.max(currentPage, 1), totalPages);

  return {
    currentPage: boundedPage,
    perPage,
    totalItems,
    totalPages,
    offset: (boundedPage - 1) * perPage,
    hasPreviousPage: boundedPage > 1,
    hasNextPage: boundedPage < totalPages
  };
}

export function pageHref(pathname: string, page: number): string {
  if (page <= 1) {
    return pathname;
  }

  return `${pathname}?page=${page}`;
}
