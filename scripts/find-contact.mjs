import fs from "fs";
const js = fs.readFileSync("doc/index-Db_ovdVj.js", "utf8");
for (const n of ["hotro@anvietoffice", "7300", "maps", "Sunrise", "19006868", "1900 6868"]) {
  const i = js.indexOf(n);
  console.log("\n==", n, i);
  if (i >= 0) console.log(js.slice(Math.max(0, i - 120), i + 220).replace(/\n/g, " "));
}
