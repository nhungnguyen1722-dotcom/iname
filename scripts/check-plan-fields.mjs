import fs from "fs";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
const url = match[1].trim().replace(/^['"]|['"]$/g, "");
const client = new pg.Client(pgConfig(url));
await client.connect();

const res = await client.query(`
  SELECT id, name, slug, category, price_label, button_label, button_url, features_json
  FROM pricing_plans
  WHERE deleted_at IS NULL AND visible = TRUE
  ORDER BY sort_order, id
`);

for (const p of res.rows) {
  console.log({
    id: p.id,
    name: p.name,
    category: p.category,
    btnUrl: p.button_url,
    featuresType: typeof p.features_json,
    features: p.features_json
  });
}

await client.end();
