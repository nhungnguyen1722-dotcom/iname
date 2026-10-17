import { Pool, type PoolConfig, type QueryResultRow } from "pg";

function poolConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL;
  if (!raw) return { max: 8 };
  const url = new URL(raw);
  url.searchParams.delete("channel_binding");
  const sslmode = url.searchParams.get("sslmode");
  const remote = Boolean(sslmode && sslmode !== "disable");
  return {
    connectionString: url.toString(),
    max: remote ? 5 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: remote ? { rejectUnauthorized: false } : undefined,
  };
}

const pool = new Pool(poolConfig());

export async function sql<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function asList<T>(value: T[] | string | null | undefined): T[] {
  if (!value) return [];
  if (typeof value === "string") return parseJson<T[]>(value, []);
  return value;
}
