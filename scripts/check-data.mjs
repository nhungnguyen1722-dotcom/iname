import pg from "pg";
import { pgConfig } from "./pg-config.mjs";
import fs from "fs";

// Read .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const dbUrl = match ? match[1] : "";

const pool = new pg.Pool(pgConfig(dbUrl));

async function main() {
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("=== TABLES ===");
  console.log(tables.rows.map((r) => r.table_name));

  const locs = await pool.query(
    "SELECT id, slug, title, address, cover_url, gallery_json FROM office_locations ORDER BY sort_order, id"
  );
  console.log("\n=== OFFICE LOCATIONS ===");
  console.log(JSON.stringify(locs.rows, null, 2));

  const cats = await pool.query(
    "SELECT id, slug, name FROM article_categories ORDER BY sort_order, id"
  );
  console.log("\n=== ARTICLE CATEGORIES ===");
  console.log(cats.rows);

  const articles = await pool.query(
    "SELECT id, slug, title, category_id, status FROM articles ORDER BY id"
  );
  console.log("\n=== ARTICLES ===");
  console.log(articles.rows);

  const sections = await pool.query(
    `SELECT p.path, s.section_type, s.title, s.eyebrow, s.sort_order 
     FROM page_sections s 
     JOIN pages p ON p.id = s.page_id 
     ORDER BY p.path, s.sort_order`
  );
  console.log("\n=== SECTIONS ===");
  console.log(sections.rows);

  const acArticles = await pool.query(
    "SELECT id, title, slug, status, cover_url FROM articles WHERE category_id = 4 AND deleted_at IS NULL ORDER BY id"
  );
  console.log("\n=== ACCOUNTING ARTICLES (Category 4) ===");
  console.table(acArticles.rows);

  const indexes = await pool.query(
    "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname"
  );
  console.log("\n=== DATABASE INDEXES ===");
  console.table(indexes.rows);

  await pool.end();
}

main().catch(console.error);
