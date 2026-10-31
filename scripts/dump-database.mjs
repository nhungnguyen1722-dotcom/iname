import fs from "fs";
import path from "path";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

for (const envFile of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const client = new pg.Client(pgConfig(process.env.DATABASE_URL));
await client.connect();
const tablesResult = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
const existing = new Set(tablesResult.rows.map((row) => row.tablename));
const preferredOrder = ["admin_users", "pages", "site_settings", "navigation_items", "services", "pricing_plans", "article_categories", "articles", "page_sections", "footer_groups", "media_assets", "contact_requests", "audit_logs", "schema_migrations", "office_locations"];
const tables = [...preferredOrder.filter((name) => existing.has(name)), ...[...existing].filter((name) => !preferredOrder.includes(name)).sort()];
let output = [
  "-- iName database export. Run against an empty PostgreSQL database.",
  fs.readFileSync(path.join(process.cwd(), "sql", "001_schema.sql"), "utf8"),
  "CREATE TABLE IF NOT EXISTS schema_migrations (migration VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT NOW());",
  fs.existsSync(path.join(process.cwd(), "sql", "014_login_attempts.sql"))
    ? fs.readFileSync(path.join(process.cwd(), "sql", "014_login_attempts.sql"), "utf8")
    : "",
  "BEGIN;",
];

function quote(value) {
  if (value === null || value === undefined) return "NULL";
  if (Buffer.isBuffer(value)) return `decode('${value.toString("hex")}', 'hex')`;
  if (value instanceof Date) value = value.toISOString();
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) value = JSON.stringify(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

const serialTables = [];
for (const table of tables) {
  const columnResult = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
    [table],
  );
  const columns = columnResult.rows.map((row) => row.column_name);
  if (!columns.length) continue;
  const data = await client.query(`SELECT * FROM public."${table.replace(/"/g, '""')}"${columns.includes("id") ? ' ORDER BY "id"' : ""}`);
  if (data.rows.length) {
    const names = columns.map((column) => `"${column.replace(/"/g, '""')}"`).join(", ");
    for (const row of data.rows) {
      const values = columns.map((column) => quote(row[column])).join(", ");
      output.push(`INSERT INTO public."${table.replace(/"/g, '""')}" (${names}) VALUES (${values});`);
    }
  }
  if (columns.includes("id")) serialTables.push(table);
}

for (const table of serialTables) {
  output.push(`SELECT setval(pg_get_serial_sequence('public."${table}"', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public."${table}";`);
}
output.push("COMMIT;", "");
await client.end();
const dumpPath = path.join(process.cwd(), "iname.sql");
fs.writeFileSync(dumpPath, output.join("\n"), "utf8");
console.log(`Database export written to ${dumpPath}.`);
