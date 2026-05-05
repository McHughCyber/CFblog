export type D1Value = string | number | boolean | null;

export class DatabaseBindingError extends Error {
  constructor() {
    super("CFBLOG_DB binding is not available.");
    this.name = "DatabaseBindingError";
  }
}

export class D1QueryError extends Error {
  cause: unknown;

  constructor(query: string, cause: unknown) {
    super(`D1 query failed: ${formatQueryForError(query)}`);
    this.name = "D1QueryError";
    this.cause = cause;
  }
}

export function getDatabase(database: D1Database | undefined): D1Database {
  if (!database) {
    throw new DatabaseBindingError();
  }

  return database;
}

function formatQueryForError(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export async function first<T>(
  database: D1Database,
  query: string,
  bindings: D1Value[] = []
): Promise<T | null> {
  try {
    return await database
      .prepare(query)
      .bind(...bindings)
      .first<T>();
  } catch (error) {
    throw new D1QueryError(query, error);
  }
}

export async function all<T>(
  database: D1Database,
  query: string,
  bindings: D1Value[] = []
): Promise<T[]> {
  try {
    const result = await database
      .prepare(query)
      .bind(...bindings)
      .all<T>();

    return result.results ?? [];
  } catch (error) {
    throw new D1QueryError(query, error);
  }
}

export async function run(
  database: D1Database,
  query: string,
  bindings: D1Value[] = []
): Promise<D1Result> {
  try {
    return await database
      .prepare(query)
      .bind(...bindings)
      .run();
  } catch (error) {
    throw new D1QueryError(query, error);
  }
}
