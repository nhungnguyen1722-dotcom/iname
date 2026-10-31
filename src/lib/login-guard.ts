import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { sql } from "./db";

const DUMMY_PASSWORD_HASH = "$2a$12$jYVrjDGsu2eJoxD5igRVZ.0./KEggVvoHmyFR04Zsab7otuey/Dpy";
const WINDOW_MINUTES = 15;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 20;

let tableReady: Promise<void> | null = null;

function ensureLoginTable() {
  tableReady ??= (async () => {
    await sql(`CREATE TABLE IF NOT EXISTS login_attempts (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      ip VARCHAR(64) NOT NULL,
      success BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    await sql(`DO $idx$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'login_attempts_email_created_idx') THEN
          CREATE INDEX login_attempts_email_created_idx ON login_attempts (email, created_at DESC);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'login_attempts_ip_created_idx') THEN
          CREATE INDEX login_attempts_ip_created_idx ON login_attempts (ip, created_at DESC);
        END IF;
      END
      $idx$`);
  })().catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

export async function clientAddress() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || headerList.get("x-real-ip") || "local").slice(0, 64);
}

export async function passwordsMatch(password: string, hash: string | null | undefined) {
  const candidate = hash && hash.startsWith("$2") ? hash : DUMMY_PASSWORD_HASH;
  try {
    const matched = await bcrypt.compare(password, candidate);
    return Boolean(hash) && matched;
  } catch {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    return false;
  }
}

export async function loginIsLimited(email: string, ip: string) {
  await ensureLoginTable();
  const rows = await sql<{ email_failures: number; ip_failures: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN email = $1 THEN 1 ELSE 0 END), 0)::int AS email_failures,
       COALESCE(SUM(CASE WHEN ip = $2 THEN 1 ELSE 0 END), 0)::int AS ip_failures
     FROM login_attempts
     WHERE success = FALSE
       AND created_at > NOW() - ($3::text || ' minutes')::interval
       AND (email = $1 OR ip = $2)`,
    [email, ip, WINDOW_MINUTES],
  );
  const failures = rows[0];
  return Number(failures?.email_failures || 0) >= EMAIL_LIMIT || Number(failures?.ip_failures || 0) >= IP_LIMIT;
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  await ensureLoginTable();
  if (success) {
    await sql("DELETE FROM login_attempts WHERE email = $1 AND ip = $2 AND success = FALSE", [email, ip]);
  }
  await sql("INSERT INTO login_attempts (email, ip, success) VALUES ($1, $2, $3)", [email, ip, success]);
  await sql("DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '2 days'");
}
