export type D1Value = string | number | boolean | null;

export class DatabaseBindingError extends Error {
  constructor() {
    super("CFBLOG_DB binding is not available.");
    this.name = "DatabaseBindingError";
  }
}

export function getDatabase(database: D1Database | undefined): D1Database {
  if (!database) {
    throw new DatabaseBindingError();
  }

  return database;
}

export async function first<T>(
  database: D1Database,
  query: string,
  bindings: D1Value[] = []
): Promise<T | null> {
  return database
    .prepare(query)
    .bind(...bindings)
    .first<T>();
}

export async function all<T>(
  database: D1Database,
  query: string,
  bindings: D1Value[] = []
): Promise<T[]> {
  const result = await database
    .prepare(query)
    .bind(...bindings)
    .all<T>();

  return result.results ?? [];
}

export async function run(
  database: D1Database,
  query: string,
  bindings: D1Value[] = []
): Promise<D1Result> {
  return database
    .prepare(query)
    .bind(...bindings)
    .run();
}
