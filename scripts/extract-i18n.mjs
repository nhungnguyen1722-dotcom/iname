import fs from "fs";
const js = fs.readFileSync("doc/index-Db_ovdVj.js", "utf8");
const re = /"([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+){1,})":"((?:\\.|[^"\\])*)"/g;
const out = {};
let m;
while ((m = re.exec(js))) {
  out[m[1]] = JSON.parse(`"${m[2]}"`);
}
fs.writeFileSync("scripts/i18n-keys.json", JSON.stringify(out, null, 2));
const prefixes = {};
for (const k of Object.keys(out)) {
  const p = k.split(".")[0];
  prefixes[p] = (prefixes[p] || 0) + 1;
}
console.log(prefixes);
console.log("total", Object.keys(out).length);

const slugHits = [...js.matchAll(/"slug":"([^"]+)"/g)].map((x) => x[1]);
console.log("slugs", [...new Set(slugHits)].slice(0, 40));
