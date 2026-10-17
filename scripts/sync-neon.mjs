import fs from "fs";
import path from "path";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const sourceUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const targetUrl = process.env.NEON_DATABASE_URL;
if (!sourceUrl || !targetUrl) {
  console.error("LOCAL_DATABASE_URL (or DATABASE_URL) and NEON_DATABASE_URL are required.");
  process.exit(1);
}

const tables = [
  "admin_users",
  "pages",
  "navigation_items",
  "site_settings",
  "services",
  "pricing_plans",
  "article_categories",
  "articles",
  "page_sections",
  "contact_requests",
  "media_assets",
  "footer_groups",
  "audit_logs",
];

function splitSql(sql) {
  return sql
    .split(";")
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

const source = new pg.Client(pgConfig(sourceUrl));
const target = new pg.Client(pgConfig(targetUrl));
await source.connect();
await target.connect();

const existing = await target.query("SELECT to_regclass('public.pages') AS pages");
if (existing.rows[0].pages) {
  const count = await target.query("SELECT COUNT(*)::int AS n FROM pages");
  if (count.rows[0].n > 0) {
    console.error("Neon already has pages. Refusing to overwrite existing content.");
    await source.end();
    await target.end();
    process.exit(1);
  }
}

const schema = fs.readFileSync(path.join(process.cwd(), "sql", "001_schema.sql"), "utf8");
for (const statement of splitSql(schema)) {
  try {
    await target.query(statement);
  } catch (error) {
    if (error && error.code === "42P07") continue;
    throw error;
  }
}

await target.query("BEGIN");
try {
  for (const table of tables) {
    const rows = await source.query(`SELECT * FROM ${table}`);
    if (rows.rows[0] && Object.prototype.hasOwnProperty.call(rows.rows[0], "id")) {
      rows.rows.sort((a, b) => Number(a.id) - Number(b.id));
    }
    if (!rows.rows.length) {
      console.log(`${table}: 0`);
      continue;
    }
    const columns = Object.keys(rows.rows[0]);
    const chunkSize = 40;
    for (let offset = 0; offset < rows.rows.length; offset += chunkSize) {
      const chunk = rows.rows.slice(offset, offset + chunkSize);
      const values = [];
      const placeholders = chunk.map((row, rowIndex) => {
        const marks = columns.map((column, columnIndex) => {
          values.push(row[column]);
          return `$${rowIndex * columns.length + columnIndex + 1}`;
        });
        return `(${marks.join(",")})`;
      });
      await target.query(
        `INSERT INTO ${table} (${columns.map((column) => `"${column}"`).join(",")}) VALUES ${placeholders.join(",")}`,
        values,
      );
    }
    const sequenceName = Object.prototype.hasOwnProperty.call(rows.rows[0], "id")
      ? (await target.query("SELECT pg_get_serial_sequence($1, 'id') AS name", [table])).rows[0]?.name
      : null;
    if (sequenceName) {
      await target.query(`SELECT setval($1, (SELECT COALESCE(MAX(id), 1) FROM ${table}), true)`, [sequenceName]);
    }
    console.log(`${table}: ${rows.rows.length}`);
  }
  await target.query("COMMIT");
} catch (error) {
  await target.query("ROLLBACK");
  throw error;
}

const check = await target.query(
  `SELECT section_key, image_url IS NOT NULL AS has_image, gallery_json
   FROM page_sections
   WHERE section_key IN ('home-hero', 'vo-intro', 'vo-gallery', 'ac-credentials')
   ORDER BY id`,
);
console.log(JSON.stringify(check.rows));
await source.end();
await target.end();
console.log("Neon copy finished.");
