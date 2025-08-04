let isDragging = false;
let startX = 0,
  startY = 0;
let translateX = 0,
  translateY = 0;
let scale = 1;

function updateTransform(itemsDiv: HTMLDivElement) {
  itemsDiv.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function createMouseDownHandler(
  itemsDiv: HTMLDivElement,
): (ev: MouseEvent) => void {
  return (ev) => {
    isDragging = true;
    startX = ev.clientX;
    startY = ev.clientY;
    itemsDiv.style.cursor = "grabbing";
  };
}

function createMouseMoveHandler(
  itemsDiv: HTMLDivElement,
): (ev: MouseEvent) => void {
  return (ev) => {
    if (!isDragging) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    startX += dx;
    startY += dy;
    translateX += dx;
    translateY += dy;
    updateTransform(itemsDiv);
  };
}

function createMouseUpHandler(
  itemsDiv: HTMLDivElement,
): (ev: MouseEvent) => void {
  return (_ev) => {
    if (!isDragging) return;
    isDragging = false;
    itemsDiv.style.cursor = "grab";
  };
}

function createWheelHandler(
  itemsDiv: HTMLDivElement,
): (ev: WheelEvent) => void {
  return (ev) => {
    ev.preventDefault();
    const factor = ev.deltaY < 0 ? 1.1 : 0.9;
    translateX = ev.clientX - (ev.clientX - translateX) * factor;
    translateY = ev.clientY - (ev.clientY - translateY) * factor;
    scale *= factor;
    updateTransform(itemsDiv);
  };
}

type ListenerKey = "mousedown" | "mousemove" | "mouseup" | "wheel";

const handlers: Partial<{
  [K in ListenerKey]: (ev: DocumentEventMap[K]) => void;
}> = {};

export function initListeners(itemsDiv: HTMLDivElement) {
  itemsDiv.style.transformOrigin = "0 0";
  document.body.style.cursor = "grab";

  handlers.mousedown = createMouseDownHandler(itemsDiv);
  handlers.mousemove = createMouseMoveHandler(itemsDiv);
  handlers.mouseup = createMouseUpHandler(itemsDiv);
  handlers.wheel = createWheelHandler(itemsDiv);

  Object.keys(handlers).forEach((event) => {
    document.addEventListener(event, handlers[event]);
  });
}

export function cleanupListeners() {
  Object.keys(handlers).forEach((event) => {
    document.removeEventListener(event, handlers[event]);
  });
  translateX = 0;
  translateY = 0;
  scale = 1;
  const itemsDiv = document.querySelector<HTMLDivElement>("#items");
  if (!itemsDiv) {
    console.error("ITEMS DIV NOT FOUND!");
    return;
  }
  updateTransform(itemsDiv);
}
