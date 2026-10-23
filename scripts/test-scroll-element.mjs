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
await new Promise((r) => setTimeout(r, 3000));
const res = await send("Runtime.evaluate", {
  expression: `(() => {
    const tab = document.querySelectorAll('button[role="tab"]')[1];
    document.documentElement.scrollTop = 2500;
    const r = tab.getBoundingClientRect();
    return {
      scrollingElement: document.scrollingElement.tagName,
      htmlHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      windowHeight: window.innerHeight,
      scrollTop: document.documentElement.scrollTop,
      rect: { x: r.x, y: r.y, width: r.width, height: r.height }
    };
  })()`,
  returnByValue: true,
});
console.log(res.result?.value);
ws.close();
chromeProcess.kill();
