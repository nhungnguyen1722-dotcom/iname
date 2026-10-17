import fs from "fs";
const js = fs.readFileSync("doc/index-Db_ovdVj.js", "utf8");
const i = js.indexOf("dia-chi-dang-ky-kinh-doanh-can-dieu-kien-gi");
console.log("idx", i);
if (i >= 0) console.log(js.slice(Math.max(0, i - 200), i + 1500));
