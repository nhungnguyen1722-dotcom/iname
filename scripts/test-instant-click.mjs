import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromeProcess = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=9222",
  "--disable-gpu",
  "--no-sandbox",
  "--window-size=1280,1000",
  "about:blank",
]);

await new Promise((r) => setTimeout(r, 1500));

const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000", { method: "PUT" });
const tab = await newTabRes.json();

const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 1;
const callbacks = new Map();

function send(method, params = {}) {
  return new Promise((resolve) => {
    const msgId = id++;
    callbacks.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.id && callbacks.has(data.id)) {
    const cb = callbacks.get(data.id);
    callbacks.delete(data.id);
    cb(data.result);
  }
};

await new Promise((r) => (ws.onopen = r));
await send("Runtime.enable");
await send("Page.enable");
await send("DOM.enable");

await new Promise((r) => setTimeout(r, 3000));

// Disable smooth scrolling temporarily to test instant scroll
const pos = await send("Runtime.evaluate", {
  expression: `
    (() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const tab = document.querySelectorAll('button[role="tab"]')[1];
      tab.scrollIntoView({ block: 'center' });
      const rect = tab.getBoundingClientRect();
      const elAtPoint = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        tabText: tab.textContent,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        elAtPoint: elAtPoint ? {
          tag: elAtPoint.tagName,
          text: elAtPoint.textContent,
          isTab: elAtPoint === tab
        } : null
      };
    })()
  `,
  returnByValue: true,
});

console.log("Tab 1 position after instant scrollIntoView:", pos.result?.value);

const rect = pos.result?.value?.rect;
if (rect && pos.result?.value?.elAtPoint?.isTab) {
  const x = Math.round(rect.x + rect.width / 2);
  const y = Math.round(rect.y + rect.height / 2);
  console.log(`Dispatching mouse event at (${x}, ${y})...`);

  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });

  await new Promise((r) => setTimeout(r, 1000));

  const afterState = await send("Runtime.evaluate", {
    expression: `
      (() => {
        const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
        return {
          tabs: tabs.map(t => ({ text: t.textContent.trim(), selected: t.getAttribute('aria-selected') })),
          activeCardTitles: Array.from(document.querySelectorAll('.pricing-plan-card h3')).map(h => h.textContent.trim())
        };
      })()
    `,
    returnByValue: true,
  });

  console.log("State after real mouse click on tab 1:", JSON.stringify(afterState.result?.value, null, 2));
}

ws.close();
chromeProcess.kill();
