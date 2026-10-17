import fs from "fs";
const js = fs.readFileSync("doc/index-Db_ovdVj.js", "utf8");
const needles = [
  "Văn phòng ảo có được dùng làm địa chỉ",
  "Tôi cần chuẩn bị giấy tờ gì",
  "khác gì so với thuê nhân viên",
];
for (const n of needles) {
  const i = js.indexOf(n);
  console.log("\n---", n, i);
  if (i >= 0) console.log(js.slice(i, i + 800));
}
