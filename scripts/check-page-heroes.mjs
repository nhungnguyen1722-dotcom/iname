import fs from "fs";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const client = new pg.Client(pgConfig(match[1]));

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT p.path, s.section_key, s.section_type, s.title, s.button_label, s.secondary_button_label
    FROM page_sections s
    JOIN pages p ON p.id = s.page_id
    WHERE p.path IN ('/van-phong-ao', '/ke-toan', '/bang-gia', '/giai-phap-cong-nghe')
    ORDER BY p.path, s.sort_order
  `);
  console.table(res.rows);
  await client.end();
}

main().catch(console.error);
