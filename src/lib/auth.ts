import { cookies } from "next/headers";
import { sql } from "./db";
import { verifySessionToken } from "./session";

export const SESSION_COOKIE = "iname_session";

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function getSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
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
