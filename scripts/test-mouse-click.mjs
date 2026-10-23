import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromeProcess = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=9222",
  "--disable-gpu",
  "--no-sandbox",
  "--window-size=1280,900",
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

await new Promise((r) => setTimeout(r, 4000));

// Scroll tabs into view and get their coordinates
const tabInfo = await send("Runtime.evaluate", {
  expression: `
    (() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      if (!tabs.length) return null;
      tabs[1].scrollIntoView({ block: 'center' });
      return tabs.map((t, idx) => {
        const rect = t.getBoundingClientRect();
        const elAtPoint = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return {
          idx,
          text: t.textContent.trim(),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          elementFromPoint: elAtPoint ? {
            tag: elAtPoint.tagName,
            className: elAtPoint.className,
            id: elAtPoint.id,
            isSame: elAtPoint === t || t.contains(elAtPoint)
          } : null
        };
      });
    })()
  `,
  returnByValue: true,
});

console.log("Tab elementFromPoint info:", JSON.stringify(tabInfo.result?.value, null, 2));

// Test real mouse click via CDP Input.dispatchMouseEvent on tab 1
const rect = tabInfo.result?.value?.[1]?.rect;
if (rect) {
  const clickX = rect.x + rect.width / 2;
  const clickY = rect.y + rect.height / 2;
  console.log("Dispatching real mouse click at:", clickX, clickY);

  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: clickX, y: clickY, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: clickX, y: clickY, button: "left", clickCount: 1 });

  await new Promise((r) => setTimeout(r, 1000));

  const afterMouseClick = await send("Runtime.evaluate", {
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

  console.log("After real mouse click:", JSON.stringify(afterMouseClick.result?.value, null, 2));
}

ws.close();
chromeProcess.kill();
