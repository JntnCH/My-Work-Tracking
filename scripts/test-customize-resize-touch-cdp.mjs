const response = await fetch("http://127.0.0.1:9222/json");
const targets = await response.json();
const target = targets.find(
  (item) => item.type === "page" && item.url.startsWith("http://localhost:3000"),
);
if (!target?.webSocketDebuggerUrl) throw new Error("ไม่พบหน้า localhost:3000 สำหรับทดสอบ Resize");

const socket = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(JSON.stringify(message.error)));
  else resolve(message.result);
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
  if (result.exceptionDetails)
    throw new Error(result.exceptionDetails.text ?? "Runtime evaluation failed");
  return result.result?.value;
}

await command("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await evaluate(`(() => {
  const element = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  element?.scrollIntoView({ block: 'center' });
})()`);
await new Promise((resolve) => setTimeout(resolve, 80));
const before = await evaluate(`(() => {
  const card = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  const handle = card?.querySelector('button[aria-label^="ปรับขนาด"]');
  if (!card || !handle) return { found: false };
  const cardRect = card.getBoundingClientRect();
  const handleRect = handle.getBoundingClientRect();
  return {
    found: true,
    width: card.style.width,
    height: card.style.height,
    left: card.style.left,
    top: card.style.top,
    cardRect: { x: cardRect.x, y: cardRect.y, width: cardRect.width, height: cardRect.height },
    handleRect: { x: handleRect.x, y: handleRect.y, width: handleRect.width, height: handleRect.height },
  };
})()`);
if (!before?.found) throw new Error("ไม่พบ Resize Handle ของ work-days");
const startX = before.handleRect.x + before.handleRect.width / 2;
const startY = before.handleRect.y + before.handleRect.height / 2;
const endX = startX + 70;
const endY = startY + 55;
const touch = (x, y) => ({ id: 1, x, y, radiusX: 8, radiusY: 8, force: 1 });
await command("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [touch(startX, startY)],
  modifiers: 0,
});
await new Promise((resolve) => setTimeout(resolve, 40));
await command("Input.dispatchTouchEvent", {
  type: "touchMove",
  touchPoints: [touch(endX, endY)],
  modifiers: 0,
});
await new Promise((resolve) => setTimeout(resolve, 60));
const during = await evaluate(`(() => {
  const card = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  return card ? {
    width: card.style.width,
    height: card.style.height,
    left: card.style.left,
    top: card.style.top,
    interacting: card.getAttribute('data-dashboard-card-interacting'),
    selected: card.getAttribute('data-dashboard-card-selected'),
  } : null;
})()`);
await command("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [], modifiers: 0 });
await new Promise((resolve) => setTimeout(resolve, 80));
const after = await evaluate(`(() => {
  const card = document.querySelector('[data-dashboard-customization-viewport="mobile"] [data-dashboard-card-id="work-days"]');
  return card ? {
    width: card.style.width,
    height: card.style.height,
    left: card.style.left,
    top: card.style.top,
    interacting: card.getAttribute('data-dashboard-card-interacting'),
    selected: card.getAttribute('data-dashboard-card-selected'),
  } : null;
})()`);
console.log(
  JSON.stringify(
    {
      before,
      during,
      after,
      resized: before.width !== after?.width || before.height !== after?.height,
    },
    null,
    2,
  ),
);
await command("Emulation.clearDeviceMetricsOverride");
socket.close();
