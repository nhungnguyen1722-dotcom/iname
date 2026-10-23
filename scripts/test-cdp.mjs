import { spawn } from "child_process";
import http from "http";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromeProcess = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=9222",
  "--disable-gpu",
  "--no-sandbox",
  "about:blank",
]);

await new Promise((r) => setTimeout(r, 1500));

// Get websocket debugger url
const versionRes = await fetch("http://127.0.0.1:9222/json/version");
const version = await versionRes.json();
console.log("Browser debugger URL:", version.webSocketDebuggerUrl);

// Create a new target/page
const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000", { method: "PUT" });
const tab = await newTabRes.json();
console.log("Tab WebSocket URL:", tab.webSocketDebuggerUrl);

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
  if (data.method === "Runtime.consoleAPICalled") {
    console.log("[CONSOLE]", data.params.type, data.params.args.map(a => a.value || a.description).join(" "));
  } else if (data.method === "Runtime.exceptionThrown") {
    console.error("[EXCEPTION]", data.params.exceptionDetails);
  }
  if (data.id && callbacks.has(data.id)) {
    const cb = callbacks.get(data.id);
    callbacks.delete(data.id);
    cb(data.result);
  }
};

await new Promise((r) => (ws.onopen = r));
await send("Runtime.enable");
await send("Page.enable");

// Wait for page load
console.log("Waiting for page load...");
await new Promise((r) => setTimeout(r, 4000));

// Query tabs in the page
const evalTabs = await send("Runtime.evaluate", {
  expression: `
    (() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      return {
        tabCount: tabs.length,
        tabs: tabs.map(t => ({
          text: t.textContent.trim(),
          selected: t.getAttribute('aria-selected'),
          cursor: window.getComputedStyle(t).cursor
        })),
        activeCardTitles: Array.from(document.querySelectorAll('.pricing-plan-card h3')).map(h => h.textContent.trim())
      };
    })()
  `,
  returnByValue: true,
});

console.log("Initial state:", JSON.stringify(evalTabs.result?.value, null, 2));

// Now click the second tab ("Kế toán - Thuế")
console.log("Clicking second tab...");
const clickTab = await send("Runtime.evaluate", {
  expression: `
    (() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      if (tabs.length >= 2) {
        tabs[1].click();
        return "Clicked tab 1: " + tabs[1].textContent;
      }
      return "Tab 1 not found";
    })()
  `,
  returnByValue: true,
});
console.log("Click result:", clickTab.result?.value);

await new Promise((r) => setTimeout(r, 1000));

// Check state after click
const afterClick = await send("Runtime.evaluate", {
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

console.log("After click second tab state:", JSON.stringify(afterClick.result?.value, null, 2));

// Now click third tab ("Giải pháp Công nghệ")
console.log("Clicking third tab...");
await send("Runtime.evaluate", {
  expression: `
    (() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      if (tabs.length >= 3) {
        tabs[2].click();
      }
    })()
  `,
});

await new Promise((r) => setTimeout(r, 1000));

const afterThird = await send("Runtime.evaluate", {
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

console.log("After click third tab state:", JSON.stringify(afterThird.result?.value, null, 2));

ws.close();
chromeProcess.kill();
