import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromeProcess = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9222", "about:blank"]);
await new Promise((r) => setTimeout(r, 1000));
const tab = await (await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000", { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 1;
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const msgId = id++;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === msgId) {
        ws.removeEventListener("message", handler);
        resolve(data.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.method === "Runtime.consoleAPICalled") {
    console.log("[CONSOLE]", data.params.type, data.params.args.map((a) => a.value || a.description).join(" "));
  } else if (data.method === "Runtime.exceptionThrown") {
    console.error("[EXCEPTION]", data.params.exceptionDetails);
  }
});

await send("Runtime.enable");
await send("Page.enable");
await new Promise((r) => setTimeout(r, 4000));

const check = await send("Runtime.evaluate", {
  expression: `(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText.slice(0, 500),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())
    };
  })()`,
  returnByValue: true,
});

console.log("Page check:", check.result?.value);
ws.close();
chromeProcess.kill();
