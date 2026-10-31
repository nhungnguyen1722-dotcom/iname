import { Pool, type PoolConfig, type QueryResultRow } from "pg";

function poolConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL;
  const serverless = process.env.VERCEL === "1";
  if (!raw) {
    return {
      max: serverless ? 1 : 8,
      idleTimeoutMillis: serverless ? 5_000 : 20_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: serverless,
    };
  }

  const url = new URL(raw);
  url.searchParams.delete("channel_binding");
  const sslmode = url.searchParams.get("sslmode");
  const remote = Boolean(sslmode && sslmode !== "disable");
  url.searchParams.delete("sslmode");

  return {
    connectionString: url.toString(),
    max: serverless ? 1 : 10,
    idleTimeoutMillis: serverless ? 5_000 : 20_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: serverless,
    ssl: remote ? { rejectUnauthorized: true } : undefined,
  };
}

const globalForDb = globalThis as unknown as { inamePool?: Pool };

function getPool() {
  if (!globalForDb.inamePool) {
    const pool = new Pool(poolConfig());
    pool.on("error", (error) => {
      console.error("Postgres pool idle client error", error);
    });
    globalForDb.inamePool = pool;
  }
  return globalForDb.inamePool;
}

export async function sql<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const result = await getPool().query<T>(text, params);
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
