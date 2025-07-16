import { Board } from "microboard-temp";
import type { BoardSnapshot } from "microboard-temp";

export interface TestRecorder {
  start: () => void;
  stop: () => void;
}

export function createTester(getBoard: () => Board): TestRecorder {
  const events: EventData[] = [];
  let snapshot: BoardSnapshot | null = null;

  const eventsToListenFor = [
    "click",
    "pointerdown",
    "pointermove",
    "pointerup",
    "wheel",
    "keydown",
    "keyup",
  ];

  function start(): void {
    const board = getBoard();
    eventsToListenFor.forEach((event) =>
      document.addEventListener(event, recordEvent),
    );
    snapshot = board.getSnapshot();
  }

  function stop(): void {
    if (!snapshot) {
      return;
    }
    const board = getBoard();
    eventsToListenFor.forEach((event) =>
      document.removeEventListener(event, recordEvent),
    );
    const compressedEvents = compressEvents(events);
    const givenScript = generateDeserializePlaywrightCode(snapshot);
    const whenScript = generateEventsPlaywrightCode(compressedEvents);
    const thenScript = generateComparisonPlaywrightCode(board.getSnapshot());
    const cucumberScript = generateCucumberScript(
      givenScript,
      whenScript,
      thenScript,
    );
    console.log("Recorded Playwright Script:\n", cucumberScript);
  }

  function recordEvent(event: Event): void {
    const eventData = createEventData(event);
    if (eventData) {
      events.push(eventData);
    }
  }

  return {
    start,
    stop,
  };
}

function createEventData(event: Event): EventData | null {
  switch (event.type) {
    case "pointerdown":
    case "pointerup":
    case "pointermove":
      return isCanvasElement(event.target as Element)
        ? createPointerEventData(event as PointerEvent)
        : null;
    case "wheel":
      return createWheelEventData(event as ChromeWheelEvent);
    case "keydown":
    case "keyup":
      return createKeyboardEventData(event as KeyboardEvent);
    case "click":
      return isCanvasElement(event.target as Element)
        ? null
        : createClickEventData(event as MouseEvent);
    default:
      return createClickEventData(event as MouseEvent);
  }
}

function isCanvasElement(target: Element): boolean {
  return target.nodeName.toLowerCase() === "canvas";
}

type PointerEventType = "pointerup" | "pointerdown" | "pointermove";

interface PointerEventData<T = PointerEventType> {
  timestamp: number;
  type: T;
  x: number;
  y: number;
  selector: string;
}

interface CompressedPointermoveEventData {
  type: "pointermove";
  events: PointerEventData<"pointermove">[];
}

function createPointerEventData(event: PointerEvent): PointerEventData {
  return {
    timestamp: event.timeStamp,
    type: event.type as PointerEventType,
    x: parseFloat(event.offsetX.toFixed(2)),
    y: parseFloat(event.offsetY.toFixed(2)),
    selector: getSelector(event.target as Element),
  };
}

interface WheelEventData {
  timestamp: number;
  type: "wheel";
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  wheelDeltaX: number;
  wheelDeltaY: number;
  selector: string;
}

interface CompressedWheelEventData {
  type: "wheel";
  events: WheelEventData[];
}

interface ChromeWheelEvent extends WheelEvent {
  wheelDelta: number;
  wheelDeltaX: number;
  wheelDeltaY: number;
}

function createWheelEventData(event: ChromeWheelEvent): WheelEventData {
  return {
    timestamp: event.timeStamp,
    type: "wheel",
    x: parseFloat(event.offsetX.toFixed(2)),
    y: parseFloat(event.offsetY.toFixed(2)),
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    wheelDeltaX: event.wheelDeltaX ?? 0,
    wheelDeltaY: event.wheelDeltaY ?? 0,
    selector: getSelector(event.target as Element),
  };
}

type KeyboardEventType = "keydown" | "keyup";

interface KeyboardEventData {
  timestamp: number;
  type: KeyboardEventType;
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  selector: string;
}

function createKeyboardEventData(event: KeyboardEvent): KeyboardEventData {
  return {
    timestamp: event.timeStamp,
    type: event.type as KeyboardEventType,
    key: event.key,
    code: event.code,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    metaKey: event.metaKey,
    selector: getSelector(event.target as Element),
  };
}

interface ClickEventData {
  timestamp: number;
  type: "click";
  selector: string;
}

function createClickEventData(event: MouseEvent): ClickEventData {
  return {
    timestamp: event.timeStamp,
    type: "click",
    selector: getSelector(event.target as Element),
  };
}

function getSelector(el: Element): string {
  while (el) {
    if (el.id) {
      return `#${el.id}`;
    }
    el = el.parentElement as Element;
  }
  return "body";
}

type EventData =
  | ClickEventData
  | WheelEventData
  | KeyboardEventData
  | PointerEventData<"pointerup">
  | PointerEventData<"pointerdown">
  | PointerEventData<"pointermove">;

type CompressedEventData =
  | ClickEventData
  | CompressedWheelEventData
  | KeyboardEventData
  | PointerEventData<"pointerup">
  | PointerEventData<"pointerdown">
  | CompressedPointermoveEventData;

function compressEvents(eventList: EventData[]): CompressedEventData[] {
  const compressed: CompressedEventData[] = [];
  let pointerMoves: PointerEventData<"pointermove">[] = [];
  let wheelEvents: WheelEventData[] = [];
  let lastPointerMove: PointerEventData<"pointermove"> | null = null;
  let lastWheelEvent: WheelEventData | null = null;

  const POINTER_MOVE_INTERVAL = 200; // 5 times a second (1000ms / 5)
  const WHEEL_EVENT_INTERVAL = 200; // 5 times a second (1000ms / 5)

  function addNonBufferedEvent(event: CompressedEventData): void {
    flushBuffers();
    compressed.push(event);
  }

  function flushBuffers(): void {
    if (pointerMoves.length > 0) {
      compressed.push({ type: "pointermove", events: pointerMoves });
      pointerMoves = [];
    }
    if (wheelEvents.length > 0) {
      compressed.push({ type: "wheel", events: wheelEvents });
      wheelEvents = [];
    }
  }

  eventList.forEach((event) => {
    switch (event.type) {
      case "pointermove":
        if (
          !lastPointerMove ||
          event.timestamp - lastPointerMove.timestamp > POINTER_MOVE_INTERVAL
        ) {
          pointerMoves.push(event);
          lastPointerMove = event;
        } else {
          pointerMoves[pointerMoves.length - 1] = event;
        }
        break;
      case "wheel":
        if (
          !lastWheelEvent ||
          event.timestamp - lastWheelEvent.timestamp > WHEEL_EVENT_INTERVAL
        ) {
          wheelEvents.push(event);
          lastWheelEvent = event;
        } else {
          wheelEvents[wheelEvents.length - 1] = event;
        }
        break;
      default:
        addNonBufferedEvent(event);
    }
  });

  flushBuffers();

  return compressed;
}

function generateCucumberScript(
  givenScript: string,
  whenScript: string,
  thenScript: string,
): string {
  return `
import { BeforeAll, AfterAll, Given, When, Then } from "@cucumber/cucumber";
import { chromium, Page, Browser } from "playwright";
import { expect } from "chai";

let browser: Browser;
let page: Page;

BeforeAll(async () => {
	browser = await chromium.launch();
});

AfterAll(async () => {
	await browser.close();
});

Given("The board is set to initial state", async () => {
	page = await browser.newPage();
	${givenScript}
});

When("The recorded events are replayed", async () => {
	${whenScript}
});

Then("The board state should match the expected state", async () => {
	${thenScript}
});
`;
}

function generateDeserializePlaywrightCode(snapshot: BoardSnapshot): string {
  return `
		// Deserialize Board Data
		await page.evaluate(() => {
			const board = window.app.getBoard();
			board.deserialize(\`${snapshot}\`);
		});
	`;
}

function generateEventsPlaywrightCode(events: CompressedEventData[]): string {
  const scriptLines: string[] = [];

  for (const event of events) {
    scriptLines.push(getPlaywrightLine(event));
  }

  return scriptLines.join("\n");
}

function getPlaywrightLine(event: CompressedEventData): string {
  switch (event.type) {
    case "pointermove":
      const moves = event.events
        .map((event) => `{ x: ${event.x}, y: ${event.y} }`)
        .join(", ");
      return (
        `for (const { x, y } of [${moves}]) {` +
        `	await page.mouse.move(x, y);` +
        `}`
      );
    case "wheel":
      const wheelDeltas = event.events
        .map((event) => `{ deltaX: ${event.deltaX}, deltaY: ${event.deltaY} }`)
        .join(", ");
      return (
        `for (const { x, y } of [${wheelDeltas}]) {` +
        `	await page.mouse.wheel(x, y);` +
        `}`
      );
    case "click":
      return `await page.click('${event.selector}');`;
    case "pointerdown":
      return (
        `await page.mouse.move(${event.x}, ${event.y});` +
        `await page.mouse.down()`
      );
    case "pointerup":
      return (
        `await page.mouse.move(${event.x}, ${event.y});` +
        `await page.mouse.up()`
      );
    case "keydown":
      return `await page.keyboard.down('${event.key}');`;
    case "keyup":
      return `await page.keyboard.up('${event.key}');`;
    default:
      return "";
  }
}

function generateComparisonPlaywrightCode(oldSnapshot: BoardSnapshot): string {
  return `
		// Compare Board Data
		const newSnapshot = await page.evaluate(() => {
			const board = window.app.getBoard();
			return board.getSnapshot();
		});
		expect(newSnapshot.itemsData).to.equal(\`${oldSnapshot}\`);
	`;
}
