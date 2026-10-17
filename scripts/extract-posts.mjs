import fs from "fs";

const js = fs.readFileSync("doc/index-Db_ovdVj.js", "utf8");
const start = js.indexOf('[{slug:"dia-chi-dang-ky-kinh-doanh-can-dieu-kien-gi"');
if (start < 0) throw new Error("posts not found");
let i = start;
let depth = 0;
let inStr = false;
let esc = false;
for (; i < js.length; i++) {
  const ch = js[i];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === "\\") esc = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') {
    inStr = true;
    continue;
  }
  if (ch === "[") depth++;
  else if (ch === "]") {
    depth--;
    if (depth === 0) {
      i++;
      break;
    }
  }
}
const literal = js.slice(start, i);
const posts = Function(`"use strict"; return (${literal});`)();
fs.writeFileSync("scripts/posts.json", JSON.stringify(posts, null, 2));
console.log(
  posts.map((p) => `${p.slug} blocks=${p.blocks?.length ?? 0}`).join("\n"),
);
