import { cookies } from "next/headers";
import { sql } from "./db";
import { hashSessionToken, verifySessionToken } from "./session";

export const SESSION_COOKIE = "iname_session";

let revokedSessionTableReady: Promise<void> | null = null;

function ensureRevokedSessionTable() {
  revokedSessionTableReady ??= (async () => {
    await sql(`CREATE TABLE IF NOT EXISTS revoked_sessions (
      token_hash VARCHAR(64) PRIMARY KEY,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    await sql(`CREATE INDEX IF NOT EXISTS revoked_sessions_expires_at_idx
      ON revoked_sessions (expires_at)`);
  })().catch((error) => {
    revokedSessionTableReady = null;
    throw error;
  });
  return revokedSessionTableReady;
}

export async function revokeSessionToken(token: string) {
  await ensureRevokedSessionTable();
  const tokenHash = await hashSessionToken(token);
  await sql("DELETE FROM revoked_sessions WHERE expires_at <= NOW()");
  await sql(
    `INSERT INTO revoked_sessions (token_hash, expires_at)
     VALUES ($1, NOW() + INTERVAL '12 hours')
     ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
    [tokenHash],
  );
}

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session || !token) return null;
  await ensureRevokedSessionTable();
  const tokenHash = await hashSessionToken(token);
  const revoked = await sql(
    "SELECT 1 FROM revoked_sessions WHERE token_hash = $1 AND expires_at > NOW() LIMIT 1",
    [tokenHash],
  );
  return revoked.length ? null : session;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  const rows = await sql<AdminUser>(
    "SELECT id, email, name, role FROM admin_users WHERE id = $1",
    [session.sub],
  );
  const user = rows[0];
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentAdmin();
  if (!user) {
    const error = new Error("UNAUTHORIZED");
    error.name = "UnauthorizedError";
    throw error;
  }
  return user;
}
