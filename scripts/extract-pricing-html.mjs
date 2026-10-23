const res = await fetch("http://127.0.0.1:3000");
const html = await res.text();

const index = html.indexOf("Mức phí tham khảo");
console.log("Index:", index);
if (index !== -1) {
  console.log(html.slice(index - 200, index + 3000));
}
