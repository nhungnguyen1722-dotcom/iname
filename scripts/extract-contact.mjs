import fs from "fs";
const js = fs.readFileSync("doc/index-Db_ovdVj.js", "utf8");
const start = js.indexOf('nn={hotline:"1900 6868"');
const end = js.indexOf("],", js.indexOf("IA=["));
const chunk = js.slice(start, end + 1);
const value = Function(`"use strict"; const nn = ${chunk.slice(3, chunk.indexOf("},IA=")+1)}; const IA = ${chunk.slice(chunk.indexOf("IA=[")+3)}; return {nn, IA};`)();
fs.writeFileSync("scripts/contact.json", JSON.stringify(value, null, 2));
console.log(JSON.stringify(value, null, 2));
