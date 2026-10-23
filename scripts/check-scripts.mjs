const htmlRes = await fetch("http://127.0.0.1:3000");
const html = await htmlRes.text();

// Find all script src
const scriptMatches = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
console.log(`Found ${scriptMatches.length} script files:`);

let allOk = true;
for (const src of scriptMatches) {
  const url = src.startsWith("http") ? src : `http://127.0.0.1:3000${src}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`FAIL: ${src} -> status ${res.status}`);
      allOk = false;
    }
  } catch (err) {
    console.log(`ERROR: ${src} -> ${err.message}`);
    allOk = false;
  }
}

if (allOk) {
  console.log("All scripts loaded with 200 OK!");
}
