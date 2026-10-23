import fs from "fs";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
const url = match[1].trim().replace(/^['"]|['"]$/g, "");
const client = new pg.Client(pgConfig(url));
await client.connect();

const plans = await client.query("SELECT id, name, slug, category, visible, deleted_at FROM pricing_plans ORDER BY id");
console.log("=== PRICING PLANS IN DB ===");
console.table(plans.rows);

const homeSections = await client.query(`
  SELECT s.id, s.section_key, s.section_type, s.title, s.config_json, s.visible
  FROM page_sections s
  JOIN pages p ON p.id = s.page_id
  WHERE p.path = '/' AND s.section_type = 'pricing'
`);
console.log("=== HOME PRICING SECTION ===");
console.log(JSON.stringify(homeSections.rows, null, 2));

await client.end();
