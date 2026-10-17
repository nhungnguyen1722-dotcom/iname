import fs from "fs";
const data = JSON.parse(fs.readFileSync("scripts/i18n-keys.json", "utf8"));
const groups = {};
for (const [k, v] of Object.entries(data)) {
  const p = k.split(".")[0];
  (groups[p] ||= []).push(k);
}
for (const p of Object.keys(groups).sort()) {
  console.log("\n## " + p);
  for (const k of groups[p]) console.log(k + " = " + String(data[k]).replace(/\n/g, " ").slice(0, 140));
}
