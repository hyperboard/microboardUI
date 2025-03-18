import { isFiniteNumber, toFiniteNumber } from "Board/lib";
import { isSafari } from "../isSafari";
import { MemoryLogger } from "shared/Logger";

export const DeltaModes = ["pixel", "line", "page"] as const;

export type DeltaMode = (typeof DeltaModes)[number];

interface ChromeWheelEvent extends WheelEvent {
	wheelDelta?: number;
	wheelDeltaX?: number;
	wheelDeltaY?: number;
}

const WHEEL_BASE_DELTA = 120;

function getExpectedWheelDelta(): number {
	return Math.floor(WHEEL_BASE_DELTA / window.devicePixelRatio);
}

function isMouseWheelDelta(wheelDelta: number): boolean {
	const expectedDelta = getExpectedWheelDelta();
	const absWheelDelta = Math.abs(wheelDelta);
	return (
		expectedDelta === absWheelDelta ||
		expectedDelta * 2 === absWheelDelta ||
		expectedDelta * 3 === absWheelDelta
	);
}

const detector = createWheelDetector();

interface Wheel {
	isWheelDelta: boolean;
	isWheelDeltaX: boolean;
	isWheelDeltaY: boolean;
	isDeltaX: boolean;
	isDeltaY: boolean;
	isShiftKey: boolean;
	isCtrlKey: boolean;
	wheelDelta: number;
	wheelDeltaX: number;
	wheelDeltaY: number;
	deltaX: number;
	deltaY: number;
	deltaMode: "pixel" | "line" | "page";
	getTouchpadPanDeltaX: () => number;
	getTouchpadPanDeltaY: () => number;
	getTouchpadPinchMultiplier: () => number;
	getWheelScaleMultiplier: () => number;
	isProbablyTouchpadPanHorisontal: () => boolean;
	isTouchpadPinch: () => boolean;
	isProbablyMouseWheel: () => boolean;
	isIgnore: () => boolean;
}

export function createWheel(event: ChromeWheelEvent): Wheel {
	const isWheelDelta = isFiniteNumber(event.wheelDelta);
	const isWheelDeltaX = isFiniteNumber(event.wheelDeltaX);
	const isWheelDeltaY = isFiniteNumber(event.wheelDeltaY);
	const isDeltaX = isFiniteNumber(event.deltaX);
	const isDeltaY = isFiniteNumber(event.deltaY);
	const isShiftKey = event.shiftKey;
	const isCtrlKey = event.ctrlKey;
	const wheelDelta = toFiniteNumber(event.wheelDelta);
	const wheelDeltaX = toFiniteNumber(event.wheelDeltaX);
	const wheelDeltaY = toFiniteNumber(event.wheelDeltaY);
	const deltaX = toFiniteNumber(event.deltaX);
	const deltaY = toFiniteNumber(event.deltaY);
	const deltaMode = getDeltaMode(event);
	detector.handle(event);

	function getDeltaMode(event): "pixel" | "line" | "page" {
		switch (event.deltaMode) {
			case 0:
				return "pixel";
			case 1:
				return "line";
			case 2:
				return "page";
			default:
				return "line";
		}
	}

	function getTouchpadPanDeltaX(): number {
		return isDeltaX ? -deltaX : isWheelDeltaX ? wheelDeltaX / 3 : 0;
	}

	function getTouchpadPanDeltaY(): number {
		return isDeltaY
			? -deltaY
			: isWheelDeltaY
				? wheelDeltaY / 3
				: wheelDelta / 3;
	}

	function getTouchpadPinchMultiplier(): number {
		return Math.exp(getTouchpadPanDeltaY() / 100);
	}

	function getWheelScaleMultiplier(): number {
		const delta = isWheelDelta
			? Math.abs(wheelDelta) * 0.001 + 1
			: isDeltaY
				? Math.abs(deltaY) * 0.02 + 1
				: Math.abs(deltaX) * 0.02 + 1;
		const isIn = isWheelDelta ? wheelDelta > 0 : deltaY < 0;
		return isIn ? delta : 1 / delta;
	}

	function isProbablyTouchpadPanHorisontal(): boolean {
		return isShiftKey && getTouchpadPanDeltaY() !== 0;
	}

	function isTouchpadPinch(): boolean {
		return isCtrlKey;
	}

	function isProbablyMouseWheel(): boolean {
		const isChromeMouseWheel = !isCtrlKey && detector.isMouseWheel;
		const isSafariMouseWheel =
			isSafari() && wheelDelta !== -deltaY * 3 && deltaY !== 0;
		return isWheelDelta
			? isChromeMouseWheel || isSafariMouseWheel
			: deltaMode !== "pixel";
	}

	function isIgnore(): boolean {
		return detector.isIgnore;
	}

	return {
		isWheelDelta,
		isWheelDeltaX,
		isWheelDeltaY,
		isDeltaX,
		isDeltaY,
		isShiftKey,
		isCtrlKey,
		wheelDelta,
		wheelDeltaX,
		wheelDeltaY,
		deltaX,
		deltaY,
		deltaMode,
		getTouchpadPanDeltaX,
		getTouchpadPanDeltaY,
		getTouchpadPinchMultiplier,
		getWheelScaleMultiplier,
		isProbablyTouchpadPanHorisontal,
		isTouchpadPinch,
		isProbablyMouseWheel,
		isIgnore,
	};
}

interface WheelDetector {
	handle: (event: WheelEvent) => void;
	readonly isMouseWheel: boolean;
	readonly isIgnore: boolean;
}

export function createWheelDetector(): WheelDetector {
	const logSize = 10;
	const detectionFrequency = 8;
	const maxWheelDelta = 50;
	const log: number[] = [];
	let lastEventTimestamp = performance.now();
	let lastDeltaY = 0;
	let lastSpeed = 0;

	let isMouseWheel = true;
	let isTouchpad = true;
	let isIgnore = false;

	let wheelDeltaConstant: number;
	let highDeltaPrevious: number | undefined;

	function handle(event: WheelEvent): void {
		const currentTime = Date.now();
		const deltaTime = currentTime - lastEventTimestamp;
		lastEventTimestamp = currentTime;
		console.log("isMouseWheel", isMouseWheel);
		console.log("deltaTime", deltaTime);

		if (deltaTime > 200 && !isMouseWheel) {
			return;
		}

		const eventJson = getEventDataAsString(event);

		MemoryLogger.setContext("WheelHandler");
		if (event.ctrlKey) {
			MemoryLogger.log(
				`Delta: ${deltaTime}; Touchpad pinch detected: ${eventJson}`,
			);
			isMouseWheel = true;
		} else if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
			const isSmallDelta = Math.abs(event.deltaY) < 10;
			isTouchpad = isSmallDelta
				? deltaTime < 100
				: deltaTime <= 100 && isTouchpad;

			isMouseWheel = !isTouchpad;

			if (!isMouseWheel) {
				MemoryLogger.log(
					`Delta: ${deltaTime}; Is small delta: ${isSmallDelta}; Touchpad scroll detected: ${eventJson}`,
				);
			} else {
				MemoryLogger.log(
					`Delta: ${deltaTime}; Is small delta: ${isSmallDelta}; Mouse wheel detected: ${eventJson}`,
				);
			}
		}
	}

	function getEventDataAsString(event: Event): string {
		let eventData = "";
		const keys = Object.keys(event).concat(
			Object.getOwnPropertyNames(Object.getPrototypeOf(event)),
		);
		keys.forEach(key => {
			try {
				const value = event[key as keyof Event];
				if (typeof value !== "function") {
					eventData += `${key}: ${value}, `;
				}
			} catch (error) {
				eventData += `${key}: [unavailable], `;
			}
		});
		return eventData;
	}

	// function handle(event: WheelEvent): void {
	// 	const wheelDelta = event.deltaY;
	// 	const absWheelDelta = Math.abs(wheelDelta);

	// 	const currentTimestamp = performance.now();
	// 	const timeSinceLastEvent = currentTimestamp - lastEventTimestamp;
	// 	lastEventTimestamp = currentTimestamp;
	// 	console.log("timeSinceLastEvent", timeSinceLastEvent);
	// 	log.push(absWheelDelta);
	// 	if (log.length > logSize) {
	// 		log.shift();
	// 	}

	// 	let localIsMouseWheel = true;

	// 	if (absWheelDelta >= maxWheelDelta) {
	// 		let frequency = 0;

	// 		for (const value of log) {
	// 			if (value === absWheelDelta) {
	// 				frequency++;
	// 			}
	// 		}

	// 		if (frequency >= detectionFrequency) {
	// 			wheelDeltaConstant = absWheelDelta;
	// 			clearHighDeltaPrevious();
	// 		}
	// 	}

	// 	if (wheelDeltaConstant) {
	// 		if (isMouseDelta(absWheelDelta, wheelDeltaConstant)) {
	// 			localIsMouseWheel = true;
	// 		} else {
	// 			localIsMouseWheel = false;
	// 		}
	// 	} else {
	// 		if (absWheelDelta > maxWheelDelta) {
	// 			if (!highDeltaPrevious) {
	// 				highDeltaPrevious = absWheelDelta;
	// 				isIgnore = true;
	// 			} else {
	// 				if (isMouseDelta(absWheelDelta, highDeltaPrevious)) {
	// 					localIsMouseWheel = true;
	// 				} else {
	// 					localIsMouseWheel = false;
	// 				}
	// 				clearHighDeltaPrevious();
	// 			}
	// 		} else {
	// 			localIsMouseWheel = false;
	// 			clearHighDeltaPrevious();
	// 		}
	// 	}

	// 	const speed = Math.abs(absWheelDelta - lastDeltaY) / timeSinceLastEvent;
	// 	lastDeltaY = absWheelDelta;

	// 	if (absWheelDelta > maxWheelDelta && speed < lastSpeed / 2) {
	// 		localIsMouseWheel = false;
	// 	}

	// 	lastSpeed = speed;
	// 	isMouseWheel = localIsMouseWheel;
	// 	console.log("isMouseWheel", isMouseWheel);
	// }

	function isMouseDelta(
		absWheelDelta: number,
		wheelConstant: number,
	): boolean {
		return (
			absWheelDelta === wheelConstant ||
			absWheelDelta % wheelConstant === 0
		);
	}

	function clearHighDeltaPrevious(): void {
		isIgnore = false;
		highDeltaPrevious = undefined;
	}

	return {
		handle,
		get isMouseWheel() {
			return isMouseWheel;
		},
		get isIgnore() {
			return isIgnore;
		},
	};
}
