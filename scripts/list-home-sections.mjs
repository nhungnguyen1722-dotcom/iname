import fs from "fs";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
const url = match[1].trim().replace(/^['"]|['"]$/g, "");
const client = new pg.Client(pgConfig(url));
await client.connect();

const res = await client.query(`
  SELECT s.id, s.section_key, s.section_type, s.title, s.config_json, s.visible, s.sort_order
  FROM page_sections s
  JOIN pages p ON p.id = s.page_id
  WHERE p.path = '/'
  ORDER BY s.sort_order
`);

console.log(res.rows.map(r => ({ id: r.id, key: r.section_key, type: r.section_type, title: r.title, config: r.config_json })));

await client.end();
