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

async function getColumns(client, table) {
  const result = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
    [table]
  );
  return result.rows.map((row) => row.column_name);
}

loadEnv();

const neonUrl = process.env.NEON_DATABASE_URL;
const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;

if (!neonUrl) {
  console.error("❌ Lỗi: Chưa có biến NEON_DATABASE_URL trong .env hoặc .env.local");
  process.exit(1);
}
if (!localUrl) {
  console.error("❌ Lỗi: Chưa có biến DATABASE_URL (hoặc LOCAL_DATABASE_URL) trong .env hoặc .env.local");
  process.exit(1);
}

function getDatabaseConfig(connStr) {
  return pgConfig(connStr);
}

const tableOrder = [
  "schema_migrations",
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

async function ensureLocalDatabase() {
  const localParsed = new URL(localUrl);
  const dbName = localParsed.pathname.replace(/^\//, "");

  // Connect to postgres or template1 to ensure target database exists
  const adminParsed = new URL(localUrl);
  adminParsed.pathname = "/postgres";
  let adminClient;
  try {
    adminClient = new pg.Client(getDatabaseConfig(adminParsed.toString()));
    await adminClient.connect();
    const checkDb = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (checkDb.rows.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    }
  } catch (err) {
    // If connecting to /postgres fails, maybe database already exists or default db differs
  } finally {
    if (adminClient) {
      try {
        await adminClient.end();
      } catch {}
    }
  }
}

async function runLocalMigrations() {
  try {
    console.log("Applying local schema migrations if any...");
    process.env.DATABASE_URL = localUrl;
    await import("./migrate.mjs");
  } catch (err) {
    console.log("Local schema migration notice:", err.message);
  }
}

async function main() {
  await ensureLocalDatabase();
  // We can skip runLocalMigrations if schema already exists, but call it safely
  await runLocalMigrations();

  console.log("Connecting to Neon and Local PostgreSQL...");
  const neonClient = new pg.Client(getDatabaseConfig(neonUrl));
  const localClient = new pg.Client(getDatabaseConfig(localUrl));

  await Promise.all([neonClient.connect(), localClient.connect()]);
  console.log("Connected successfully to both databases.");

  // Check which tables exist in both
  const localTablesResult = await localClient.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );
  const localTables = new Set(localTablesResult.rows.map((r) => r.tablename));

  const neonTablesResult = await neonClient.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );
  const neonTables = new Set(neonTablesResult.rows.map((r) => r.tablename));

  // Determine tables to copy
  const tablesToCopy = tableOrder.filter(
    (t) => localTables.has(t) && neonTables.has(t)
  );

  console.log(`Found ${tablesToCopy.length} tables to sync: ${tablesToCopy.join(", ")}`);

  await localClient.query("BEGIN");
  try {
    try {
      await localClient.query("SET session_replication_role = 'replica'");
    } catch {}

    // Truncate or clean in reverse order to respect foreign key constraints
    console.log("Clearing existing local data in reverse order...");
    for (let i = tablesToCopy.length - 1; i >= 0; i--) {
      const table = tablesToCopy[i];
      await localClient.query(`DELETE FROM public.${quoteIdentifier(table)}`);
    }

    // Insert from Neon into Local in forward order
    for (const table of tablesToCopy) {
      const neonCols = await getColumns(neonClient, table);
      const localCols = await getColumns(localClient, table);
      const commonCols = neonCols.filter((col) => localCols.includes(col));

      if (commonCols.length === 0) continue;

      const result = await neonClient.query(
        `SELECT ${commonCols.map(quoteIdentifier).join(", ")} FROM public.${quoteIdentifier(table)} ORDER BY ${commonCols.includes("id") ? '"id"' : commonCols[0]}`
      );
      const rows = result.rows;

      if (rows.length > 0) {
        const chunkSize = 30;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const values = [];
          const placeholders = chunk.map((row, rowIndex) => {
            const marks = commonCols.map((col, colIndex) => {
              values.push(row[col]);
              return `$${rowIndex * commonCols.length + colIndex + 1}`;
            });
            return `(${marks.join(", ")})`;
          });

          await localClient.query(
            `INSERT INTO public.${quoteIdentifier(table)} (${commonCols.map(quoteIdentifier).join(", ")}) VALUES ${placeholders.join(", ")}`,
            values
          );
        }
      }

      console.log(`✔ Synced table ${table}: ${rows.length} rows`);
    }

    try {
      await localClient.query("SET session_replication_role = 'origin'");
    } catch {}
    await localClient.query("COMMIT");
  } catch (err) {
    try {
      await localClient.query("SET session_replication_role = 'origin'");
    } catch {}
    await localClient.query("ROLLBACK");
    throw err;
  }

  // Update sequences
  for (const table of tablesToCopy) {
    const cols = await getColumns(localClient, table);
    if (cols.includes("id")) {
      try {
        await localClient.query(
          `SELECT setval(
             pg_get_serial_sequence($1, 'id'),
             COALESCE(MAX(id), 1),
             MAX(id) IS NOT NULL
           ) FROM public.${quoteIdentifier(table)}`,
          [`public.${table}`]
        );
      } catch (seqErr) {
        // Ignore sequence error if table doesn't have a serial sequence
      }
    }
  }

  console.log("\n✅ Đã kéo toàn bộ dữ liệu từ Neon về Database local thành công!");
  await neonClient.end();
  await localClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Lỗi khi đồng bộ từ Neon:", err);
  process.exit(1);
});
