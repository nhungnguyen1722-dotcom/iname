import fs from "fs";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
const url = match[1].trim().replace(/^['"]|['"]$/g, "");
const client = new pg.Client(pgConfig(url));
await client.connect();

const res = await client.query(`
  SELECT s.id, s.section_key, s.section_type, s.eyebrow, s.title, s.subtitle, s.description, s.items_json
  FROM page_sections s
  JOIN pages p ON p.id = s.page_id
  WHERE p.path = '/giai-phap-cong-nghe' AND s.section_type = 'steps'
`);

console.log(JSON.stringify(res.rows, null, 2));
await client.end();
