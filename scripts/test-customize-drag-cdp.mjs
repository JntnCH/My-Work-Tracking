import process from "node:process";

const response = await fetch("http://127.0.0.1:9222/json");
const targets = await response.json();
const target = targets.find((item) => item.type === "page" && item.url.startsWith("http://localhost:3000"));
if (!target?.webSocketDebuggerUrl) {
  throw new Error("ไม่พบหน้า localhost:3000 สำหรับทดสอบ Customize Canvas");
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const commandId = ++id;
    pending.set(commandId, { resolve, reject });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Runtime evaluation failed");
  }
  return result.result?.value;
}

const before = await evaluate(`(() => {
  const element = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  if (!element) return { found: false };
  const rect = element.getBoundingClientRect();
  return {
    found: true,
    id: element.getAttribute('data-dashboard-card-id'),
    left: element.style.left,
    top: element.style.top,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
})()`);
if (!before?.found) throw new Error("ไม่พบการ์ด work-days บน Mobile Customize Canvas");

const startX = before.x + Math.min(80, before.width / 2);
const startY = before.y + Math.min(35, before.height / 2);
const endX = startX + 64;
const endY = startY + 42;

await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: startX, y: startY, button: "none" });
await command("Input.dispatchMouseEvent", { type: "mousePressed", x: startX, y: startY, button: "left", clickCount: 1 });
await new Promise((resolve) => setTimeout(resolve, 40));
await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: endX, y: endY, button: "left", buttons: 1 });
await new Promise((resolve) => setTimeout(resolve, 40));
const during = await evaluate(`(() => {
  const element = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  if (!element) return null;
  return {
    left: element.style.left,
    top: element.style.top,
    interacting: element.getAttribute('data-dashboard-card-interacting'),
    selected: element.getAttribute('data-dashboard-card-selected'),
  };
})()`);
await command("Input.dispatchMouseEvent", { type: "mouseReleased", x: endX, y: endY, button: "left", clickCount: 1 });
await new Promise((resolve) => setTimeout(resolve, 80));
const after = await evaluate(`(() => {
  const element = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  if (!element) return null;
  return {
    left: element.style.left,
    top: element.style.top,
    interacting: element.getAttribute('data-dashboard-card-interacting'),
    selected: element.getAttribute('data-dashboard-card-selected'),
  };
})()`);

console.log(JSON.stringify({ before, during, after, moved: before.left !== after?.left || before.top !== after?.top }, null, 2));
socket.close();
