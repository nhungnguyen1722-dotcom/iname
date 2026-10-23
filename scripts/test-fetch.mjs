const res = await fetch("http://127.0.0.1:3000");
console.log("Status:", res.status);
const text = await res.text();
console.log("Body length:", text.length);
console.log("Body preview:", text.slice(0, 1000));
