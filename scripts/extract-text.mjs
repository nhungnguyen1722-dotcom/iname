import fs from "fs";

function text(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

for (const f of [
  "iname-kien-thuc",
  "iname-bang-gia",
  "iname-ke-toan",
  "iname-lien-he",
  "iname-trang-chu",
  "iname-van-phong-ao",
]) {
  const raw = fs.readFileSync(`doc/html/${f}.html`, "utf8");
  const lines = text(raw)
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  console.log(`\n===== ${f} len ${raw.length} lines ${lines.length} =====`);
  console.log(lines.slice(0, 120).join("\n"));
}
