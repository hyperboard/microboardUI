import { Board } from "Board";
// import { Selection } from "Board/Selection";

interface Tester {
	given: () => void;
	when: () => void;
	then: () => void;
}

export function createTester(getBoard: () => Board): Tester {
	let events: EventData[] = [];

	const eventsToListenFor = [
		"click",
		"pointerdown",
		"pointermove",
		"pointerup",
		"wheel",
		"keydown",
		"keyup",
	];

	function startRecording(): void {
		eventsToListenFor.forEach(event =>
			document.addEventListener(event, recordEvent),
		);
	}

	function stopRecording(): void {
		eventsToListenFor.forEach(event =>
			document.removeEventListener(event, recordEvent),
		);
	}

	function recordEvent(event: Event): void {
		const eventData = createEventData(event);
		if (eventData) {
			events.push(eventData);
		}
	}

	function given(): void {}

	function when(): void {
		startRecording();
	}

	function then(): void {
		stopRecording();
		const compressedEvents = compressEvents(events);
		const script = generatePlaywrightCode(compressedEvents);
		console.log("Recorded Playwright Script:\n", script.join("\n"));
	}

	return {
		given,
		when,
		then,
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

interface PointerEventData<T = "pointerup" | "pointerdown" | "pointermove"> {
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
		type: event.type,
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

interface KeyboardEventData {
	timestamp: number;
	type: "keydown" | "keyup";
	key: string;
	keyCode: number;
	altKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	metaKey: boolean;
	selector: string;
}

function createKeyboardEventData(event: KeyboardEvent): KeyboardEventData {
	return {
		timestamp: event.timeStamp,
		type: event.type,
		key: event.key,
		keyCode: event.keyCode,
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

	eventList.forEach(event => {
		switch (event.type) {
			case "pointermove":
				pointerMoves.push(event);
				break;
			case "wheel":
				wheelEvents.push(event);
				break;
			default:
				addNonBufferedEvent(event);
		}
	});

	flushBuffers();

	return compressed;
}

function generatePlaywrightCode(events: CompressedEventData[]): string[] {
	const scriptLines: string[] = [];

	for (const event of events) {
		scriptLines.push(getPlaywrightLine(event));
	}

	return scriptLines;
}

function getPlaywrightLine(event: CompressedEventData): string {
	switch (event.type) {
		case "pointermove":
			const moves = event.events
				.map(event => `{ x: ${event.x}, y: ${event.y} }`)
				.join(", ");
			return `[${moves}].forEach(async ({x, y}) => { await page.mouse.move(x, y); }`;
		case "wheel":
			const wheelDeltas = event.events
				.map(
					event =>
						`{ deltaX: ${event.deltaX}, deltaY: ${event.deltaY} }`,
				)
				.join(", ");
			return `[${wheelDeltas}].forEach(async ({x, y}) => { await page.mouse.wheel(x, y); }`;
		case "click":
			return `await page.click('${event.selector}');`;
		case "pointerdown":
			return `await page.mouse.down({ x: ${event.x}, y: ${event.y} });`;
		case "pointerup":
			return `await page.mouse.up();`;
		case "keydown":
			return `await page.keyboard.down('${event.key}');`;
		case "keyup":
			return `await page.keyboard.up('${event.key}');`;
		default:
			return "";
	}
}
