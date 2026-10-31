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

function rowTime(row) {
  if (!row || row.updated_at == null) return null;
  const time = new Date(row.updated_at).getTime();
  return Number.isFinite(time) ? time : null;
}

function rowKey(row, columns) {
  const values = columns.map((column) => row[column]);
  if (values.some((value) => value === null || value === undefined)) return null;
  return JSON.stringify(values);
}

function identityValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  return value ?? null;
}

function identityKey(row, columns) {
  return JSON.stringify(columns.map((column) => identityValue(row[column])));
}

function parentsBeforeChildren(rows) {
  const byId = new Map(rows.map((row) => [String(row.id), row]));
  const sorted = [];
  const seen = new Set();
  const visit = (row) => {
    if (!row || seen.has(String(row.id))) return;
    seen.add(String(row.id));
    if (row.parent_id != null) visit(byId.get(String(row.parent_id)));
    sorted.push(row);
  };
  for (const row of rows) visit(row);
  return sorted;
}

const APPEND_ONLY_TABLES = new Set(["contact_requests", "audit_logs", "login_attempts"]);
const SERIAL_IDENTITY = {
  navigation_items: ["href", "parent_id"],
  contact_requests: ["full_name", "phone", "email", "message", "source_path", "created_at"],
  audit_logs: ["admin_user_id", "action", "entity", "entity_id", "detail", "created_at"],
  login_attempts: ["email", "ip", "success", "created_at"],
};

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

async function getUniqueKeys(client, table) {
  const [constraints, indexes] = await Promise.all([
    getKeyConstraints(client, table, "UNIQUE"),
    client.query(
      `SELECT array_agg(a.attname::text ORDER BY key_column.ordinality) AS columns
       FROM pg_index i
       JOIN pg_class t ON t.oid = i.indrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
       JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS key_column(attnum, ordinality)
         ON key_column.ordinality <= i.indnkeyatts
       JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = key_column.attnum
       WHERE n.nspname = 'public'
         AND t.relname = $1
         AND i.indisunique
         AND NOT i.indisprimary
         AND i.indpred IS NULL
         AND i.indexprs IS NULL
       GROUP BY i.indexrelid`,
      [table],
    ),
  ]);
  const uniqueKeys = new Map();
  for (const columns of [...constraints, ...indexes.rows.map((row) => row.columns)]) {
    uniqueKeys.set(JSON.stringify(columns), columns);
  }
  return [...uniqueKeys.values()];
}

async function getForeignKeys(client) {
  const result = await client.query(
    `SELECT tc.table_name AS table_name,
            array_agg(kcu.column_name::text ORDER BY kcu.ordinal_position) AS columns,
            ccu.table_name AS referenced_table,
            array_agg(ccu.column_name::text ORDER BY kcu.ordinal_position) AS referenced_columns
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_catalog = tc.constraint_catalog
       AND kcu.constraint_schema = tc.constraint_schema
       AND kcu.constraint_name = tc.constraint_name
       AND kcu.table_schema = tc.table_schema
       AND kcu.table_name = tc.table_name
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_catalog = tc.constraint_catalog
       AND ccu.constraint_schema = tc.constraint_schema
       AND ccu.constraint_name = tc.constraint_name
     WHERE tc.table_schema = 'public'
       AND tc.constraint_type = 'FOREIGN KEY'
     GROUP BY tc.table_name, tc.constraint_name, ccu.table_name`,
  );
  return result.rows;
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

if (process.env.CONFIRM_NEON_SYNC !== "yes") {
  console.error("Đã chặn db:sync-neon để tránh ghi đè dữ liệu Neon.");
  console.error("Hàng chỉ có trên Neon không bị xóa. Hàng Neon có updated_at mới hơn được giữ nguyên.");
  console.error("Chạy lại với CONFIRM_NEON_SYNC=yes khi muốn đẩy dữ liệu từ máy local lên.");
  process.exit(1);
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
  "login_attempts",
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

  const states = [];

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
    const uniqueKeys = (await getUniqueKeys(target, table)).filter(
      (columns) => columns.every((column) => sourceColumns.includes(column)),
    );
    const existingRows = await target.query(
      `SELECT * FROM public.${quoteIdentifier(table)}
       ORDER BY ${primaryKey.map(quoteIdentifier).join(", ")}`,
    );
    states.push({
      table,
      columns: sourceColumns,
      primaryKey,
      uniqueKeys,
      sourceRows: rows.rows,
      targetRows: existingRows.rows,
      idMappings: new Map(),
      transfers: [],
      skipSourceKeys: new Set(),
    });
  }

  const statesByTable = new Map(states.map((state) => [state.table, state]));
  const foreignKeys = await getForeignKeys(source);
  for (const state of states) {
    const targetByPrimaryKey = new Map(
      state.targetRows.map((row) => [rowKey(row, state.primaryKey), row]),
    );
    const targetByUniqueKey = new Map(
      state.uniqueKeys.map((key) => [
        JSON.stringify(key),
        new Map(
          state.targetRows
            .map((row) => [rowKey(row, key), row])
            .filter(([keyValue]) => keyValue !== null),
        ),
      ]),
    );
    const nonPrimaryUniqueKeys = state.uniqueKeys.filter(
      (columns) => JSON.stringify(columns) !== JSON.stringify(state.primaryKey),
    );
    const reservedIds = new Set(
      state.targetRows
        .map((row) => Number(row.id))
        .filter((id) => Number.isSafeInteger(id)),
    );
    let nextId = Math.max(0, ...reservedIds) + 1;
    const allocateId = () => {
      while (reservedIds.has(nextId)) nextId += 1;
      const id = nextId;
      nextId += 1;
      reservedIds.add(id);
      if (!Number.isSafeInteger(id)) {
        throw new Error(`Cannot safely allocate a new primary key for ${state.table}.`);
      }
      return id;
    };
    const claimOrAllocate = (sourceId) => {
      const numeric = Number(sourceId);
      if (!Number.isSafeInteger(numeric) || reservedIds.has(numeric)) return allocateId();
      reservedIds.add(numeric);
      return sourceId;
    };
    const serialIdentity = SERIAL_IDENTITY[state.table];
    const serialOnly =
      state.primaryKey.length === 1 &&
      state.primaryKey[0] === "id" &&
      nonPrimaryUniqueKeys.length === 0;
    const targetByIdentity = new Map();
    const usedIdentityIds = new Set();
    if (serialIdentity) {
      for (const existing of state.targetRows) {
        const key = identityKey(existing, serialIdentity);
        const bucket = targetByIdentity.get(key);
        if (bucket) bucket.push(existing);
        else targetByIdentity.set(key, [existing]);
      }
    }
    const orderedSourceRows = state.table === "navigation_items"
      ? parentsBeforeChildren(state.sourceRows)
      : state.sourceRows;

    for (const row of orderedSourceRows) {
      const comparableRow = { ...row };
      for (const foreignKey of foreignKeys.filter((key) => key.table_name === state.table)) {
        const referencedState = statesByTable.get(foreignKey.referenced_table);
        if (
          !referencedState ||
          JSON.stringify(foreignKey.referenced_columns) !== JSON.stringify(referencedState.primaryKey)
        ) {
          continue;
        }
        const sourceForeignKey = rowKey(comparableRow, foreignKey.columns);
        const mappedKey = referencedState.idMappings.get(sourceForeignKey);
        if (mappedKey) {
          foreignKey.columns.forEach((column, index) => {
            comparableRow[column] = mappedKey[index];
          });
        }
      }
      const sourceKey = rowKey(row, state.primaryKey);
      const matches = new Map();
      for (const uniqueKey of state.uniqueKeys) {
        const keyValue = rowKey(comparableRow, uniqueKey);
        if (keyValue === null) continue;
        const match = targetByUniqueKey.get(JSON.stringify(uniqueKey)).get(keyValue);
        if (match) matches.set(rowKey(match, state.primaryKey), match);
      }
      if (matches.size > 1) {
        throw new Error(`Ambiguous unique-key matches while reconciling ${state.table}.`);
      }

      let targetRow = serialOnly ? undefined : matches.values().next().value;
      if (serialOnly) {
        if (serialIdentity) {
          const fingerprint = identityKey(comparableRow, serialIdentity);
          const bucket = (targetByIdentity.get(fingerprint) || []).filter((item) => !usedIdentityIds.has(String(item.id)));
          const chosen = bucket.find((item) => String(item.id) === String(row.id)) || bucket[0];
          if (chosen) {
            usedIdentityIds.add(String(chosen.id));
            targetRow = chosen;
            if (APPEND_ONLY_TABLES.has(state.table)) state.skipSourceKeys.add(sourceKey);
          } else {
            targetRow = { id: claimOrAllocate(row.id) };
          }
        } else {
          targetRow = { id: claimOrAllocate(row.id) };
        }
      } else if (!targetRow) {
        const primaryKeyMatch = targetByPrimaryKey.get(sourceKey);
        const hasUniqueKeyMismatch =
          primaryKeyMatch &&
          nonPrimaryUniqueKeys.some((uniqueKey) => {
            const sourceValue = rowKey(comparableRow, uniqueKey);
            const targetValue = rowKey(primaryKeyMatch, uniqueKey);
            return sourceValue !== null && targetValue !== null && sourceValue !== targetValue;
          });

        if (primaryKeyMatch && !hasUniqueKeyMismatch) {
          targetRow = primaryKeyMatch;
        } else if (primaryKeyMatch) {
          if (state.primaryKey.length !== 1 || state.primaryKey[0] !== "id") {
            throw new Error(`Cannot safely allocate a new primary key for ${state.table}.`);
          }
          targetRow = { ...row, id: allocateId() };
        } else {
          const kept = Object.fromEntries(state.primaryKey.map((column) => [column, row[column]]));
          if (kept.id != null) {
            const numeric = Number(kept.id);
            if (Number.isSafeInteger(numeric)) reservedIds.add(numeric);
          }
          targetRow = kept;
        }
      }
      state.idMappings.set(sourceKey, state.primaryKey.map((column) => targetRow[column]));
    }
  }

  for (const state of states) {
    const tableForeignKeys = foreignKeys.filter((key) => key.table_name === state.table);
    for (const sourceRow of state.sourceRows) {
      const row = { ...sourceRow };
      for (const foreignKey of tableForeignKeys) {
        const referencedState = statesByTable.get(foreignKey.referenced_table);
        if (
          !referencedState ||
          JSON.stringify(foreignKey.referenced_columns) !== JSON.stringify(referencedState.primaryKey)
        ) {
          continue;
        }
        const sourceForeignKey = rowKey(row, foreignKey.columns);
        const mappedKey = referencedState.idMappings.get(sourceForeignKey);
        if (mappedKey) {
          foreignKey.columns.forEach((column, index) => {
            row[column] = mappedKey[index];
          });
        }
      }
      const sourceKey = rowKey(sourceRow, state.primaryKey);
      if (state.skipSourceKeys.has(sourceKey)) continue;
      const mappedPrimaryKey = state.idMappings.get(sourceKey);
      state.primaryKey.forEach((column, index) => {
        row[column] = mappedPrimaryKey[index];
      });
      state.transfers.push(row);
    }
  }

  const pageState = states.find((state) => state.table === "pages");
  if (pageState && pageState.sourceRows.length === 0 && pageState.targetRows.length > 0) {
    throw new Error("Bảng pages trên máy local đang trống. Đã hủy đồng bộ, dữ liệu Neon không bị ghi đè.");
  }

  const keptByTable = new Map();
  await target.query("BEGIN");
  try {
    for (const { table, columns, primaryKey, transfers: rows, targetRows } of states) {
      const targetByPrimaryKey = new Map(targetRows.map((row) => [rowKey(row, primaryKey), row]));
      const writable = [];
      let kept = 0;
      for (const row of rows) {
        const existing = targetByPrimaryKey.get(rowKey(row, primaryKey));
        const sourceTime = rowTime(row);
        const targetTime = rowTime(existing);
        if (existing && sourceTime != null && targetTime != null && targetTime > sourceTime) {
          kept += 1;
          continue;
        }
        writable.push(row);
      }
      keptByTable.set(table, kept);
      const mutableColumns = columns.filter((column) => !primaryKey.includes(column));
      const conflictAction = APPEND_ONLY_TABLES.has(table) || !mutableColumns.length
        ? "DO NOTHING"
        : `DO UPDATE SET ${mutableColumns.map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`).join(", ")}`;
      const chunkSize = 40;

      for (let offset = 0; offset < writable.length; offset += chunkSize) {
        const chunk = writable.slice(offset, offset + chunkSize);
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

  for (const { table, sourceRows, columns, primaryKey, idMappings } of states) {
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
    const remappedIds = sourceRows.filter(
      (row) => String(row.id) !== String(idMappings.get(rowKey(row, primaryKey))?.[0]),
    ).length;
    console.log(`${table}: synced ${sourceRows.length} local rows; remapped ${remappedIds} IDs; kept ${keptByTable.get(table) || 0} newer Neon rows; Neon-only rows preserved.`);
  }
  console.log("Neon merge completed. No Neon-only rows were deleted.");
} finally {
  await Promise.all([source?.end(), target?.end()].filter(Boolean));
}
