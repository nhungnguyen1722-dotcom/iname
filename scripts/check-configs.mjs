import fs from "fs";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const client = new pg.Client(pgConfig(match[1]));

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT s.section_key, s.config_json 
    FROM page_sections s 
    WHERE s.section_key IN ('vo-services', 'ac-services', 'ac-faq')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
