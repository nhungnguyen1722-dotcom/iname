import fs from "fs";
import path from "path";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

function loadEnv() {
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
}

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

function rowKey(row, columns) {
  const values = columns.map((column) => row[column]);
  if (values.some((value) => value === null || value === undefined)) return null;
  return JSON.stringify(values);
}

async function getColumns(client, table) {
  const result = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
    [table],
  );
  return result.rows.map((row) => row.column_name);
}

async function getKeyConstraints(client, table, constraintType) {
  const result = await client.query(
    `SELECT array_agg(kcu.column_name::text ORDER BY kcu.ordinal_position) AS columns
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_catalog = tc.constraint_catalog
       AND kcu.constraint_schema = tc.constraint_schema
       AND kcu.constraint_name = tc.constraint_name
       AND kcu.table_schema = tc.table_schema
       AND kcu.table_name = tc.table_name
     WHERE tc.table_schema = 'public'
       AND tc.table_name = $1
       AND tc.constraint_type = $2
     GROUP BY tc.constraint_name`,
    [table, constraintType],
  );
  return result.rows.map((row) => row.columns);
}

loadEnv();

const sourceUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const targetUrl = process.env.NEON_DATABASE_URL;
if (!sourceUrl || !targetUrl) {
  throw new Error("LOCAL_DATABASE_URL (or DATABASE_URL) and NEON_DATABASE_URL are required.");
}

function databaseIdentity(connectionString) {
  const url = new URL(connectionString);
  return `${url.hostname.toLowerCase()}:${url.port || "5432"}${url.pathname}`;
}

if (databaseIdentity(sourceUrl) === databaseIdentity(targetUrl)) {
  throw new Error("Source and Neon target must be different databases.");
}

const tables = [
  "admin_users",
  "pages",
  "article_categories",
  "navigation_items",
  "site_settings",
  "services",
  "pricing_plans",
  "articles",
  "page_sections",
  "footer_groups",
  "media_assets",
  "contact_requests",
  "audit_logs",
  "office_locations",
];

let source;
let target;

try {
  process.env.DATABASE_URL = targetUrl;
  await import("./migrate.mjs");

  source = new pg.Client(pgConfig(sourceUrl));
  target = new pg.Client(pgConfig(targetUrl));
  await Promise.all([source.connect(), target.connect()]);

  const transfers = [];
  const uniqueConflicts = [];

  for (const table of tables) {
    const [sourceColumns, targetColumns, sourcePrimaryKeys, targetPrimaryKeys] = await Promise.all([
      getColumns(source, table),
      getColumns(target, table),
      getKeyConstraints(source, table, "PRIMARY KEY"),
      getKeyConstraints(target, table, "PRIMARY KEY"),
    ]);
    if (!sourceColumns.length || !targetColumns.length) {
      throw new Error(`Table ${table} is missing from the source or Neon database.`);
    }
    if (sourcePrimaryKeys.length !== 1 || targetPrimaryKeys.length !== 1) {
      throw new Error(`Table ${table} must have exactly one primary-key constraint.`);
    }
    const primaryKey = sourcePrimaryKeys[0];
    if (JSON.stringify(primaryKey) !== JSON.stringify(targetPrimaryKeys[0])) {
      throw new Error(`Primary-key columns differ for table ${table}.`);
    }
    const missingColumns = sourceColumns.filter((column) => !targetColumns.includes(column));
    if (missingColumns.length) {
      throw new Error(`Neon is missing columns from ${table}: ${missingColumns.join(", ")}.`);
    }

    const rows = await source.query(
      `SELECT * FROM public.${quoteIdentifier(table)}
       ORDER BY ${primaryKey.map(quoteIdentifier).join(", ")}`,
    );
    const uniqueKeys = (await getKeyConstraints(target, table, "UNIQUE")).filter(
      (columns) => columns.every((column) => sourceColumns.includes(column)),
    );
    const nonPrimaryUniqueKeys = uniqueKeys.filter(
      (columns) => JSON.stringify(columns) !== JSON.stringify(primaryKey),
    );

    if (rows.rows.length && nonPrimaryUniqueKeys.length) {
      const requiredColumns = [...new Set(nonPrimaryUniqueKeys.flat())];
      const existingRows = await target.query(
        `SELECT ${[...new Set([...primaryKey, ...requiredColumns])].map(quoteIdentifier).join(", ")}
         FROM public.${quoteIdentifier(table)}`,
      );
      for (const uniqueKey of nonPrimaryUniqueKeys) {
        const existingByKey = new Map();
        for (const row of existingRows.rows) {
          const key = rowKey(row, uniqueKey);
          if (key !== null) existingByKey.set(key, rowKey(row, primaryKey));
        }
        for (const row of rows.rows) {
          const key = rowKey(row, uniqueKey);
          if (key === null) continue;
          const existingPrimaryKey = existingByKey.get(key);
          if (existingPrimaryKey !== undefined && existingPrimaryKey !== rowKey(row, primaryKey)) {
            uniqueConflicts.push(table);
            break;
          }
        }
      }
    }

    transfers.push({ table, columns: sourceColumns, primaryKey, rows: rows.rows });
  }

  if (uniqueConflicts.length) {
    throw new Error(
      `Sync stopped before changing data: unique-key conflicts in ${[...new Set(uniqueConflicts)].join(", ")}.`,
    );
  }

  await target.query("BEGIN");
  try {
    for (const { table, columns, primaryKey, rows } of transfers) {
      const mutableColumns = columns.filter((column) => !primaryKey.includes(column));
      const conflictAction = mutableColumns.length
        ? `DO UPDATE SET ${mutableColumns.map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`).join(", ")}`
        : "DO NOTHING";
      const chunkSize = 40;

      for (let offset = 0; offset < rows.length; offset += chunkSize) {
        const chunk = rows.slice(offset, offset + chunkSize);
        const values = [];
        const placeholders = chunk.map((row, rowIndex) => {
          const marks = columns.map((column, columnIndex) => {
            values.push(row[column]);
            return `$${rowIndex * columns.length + columnIndex + 1}`;
          });
          return `(${marks.join(", ")})`;
        });
        await target.query(
          `INSERT INTO public.${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(", ")})
           VALUES ${placeholders.join(", ")}
           ON CONFLICT (${primaryKey.map(quoteIdentifier).join(", ")}) ${conflictAction}`,
          values,
        );
      }
    }
    await target.query("COMMIT");
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  }

  for (const { table, rows, columns } of transfers) {
    if (!columns.includes("id")) continue;
    await target.query(
      `SELECT setval(
         pg_get_serial_sequence($1, 'id'),
         COALESCE(MAX(id), 1),
         MAX(id) IS NOT NULL
       )
       FROM public.${quoteIdentifier(table)}`,
      [`public.${table}`],
    );
    console.log(`${table}: synced ${rows.length} local rows; Neon-only rows preserved.`);
  }
  console.log("Neon merge completed. No Neon-only rows were deleted.");
} finally {
  await Promise.all([source?.end(), target?.end()].filter(Boolean));
}
