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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const client = new pg.Client(pgConfig(process.env.DATABASE_URL));
await client.connect();
await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  migration VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
 )`);
const migrationFiles = fs.readdirSync(path.join(process.cwd(), "sql")).filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
for (const file of migrationFiles) {
  const applied = await client.query("SELECT 1 FROM schema_migrations WHERE migration = $1", [file]);
  if (applied.rowCount) continue;
  const source = fs.readFileSync(path.join(process.cwd(), "sql", file), "utf8");
  const statements = source
    .split(";")
    .map((statement) => statement.split("\n").filter((line) => !line.trim().startsWith("--")).join("\n").trim())
    .filter(Boolean);
  await client.query("BEGIN");
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    await client.query("INSERT INTO schema_migrations (migration) VALUES ($1)", [file]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
await client.end();
console.log(`Applied ${migrationFiles.length} available database migrations.`);
