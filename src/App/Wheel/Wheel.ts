import { isFiniteNumber, toFiniteNumber } from "utils";
import { isSafari } from "../isSafari";
import { WheelDetector } from "./WheelDetector";

export const DeltaModes = ["pixel", "line", "page"] as const;

export type DeltaMode = typeof DeltaModes[number];

interface ChromeWheelEvent extends WheelEvent {
	wheelDelta?: number;
	wheelDeltaX?: number;
	wheelDeltaY?: number;
}

const detector = new WheelDetector();

export class Wheel {
	isWheelDelta = isFiniteNumber(this.event.wheelDelta);
	isWheelDeltaX = isFiniteNumber(this.event.wheelDeltaX);
	isWheelDeltaY = isFiniteNumber(this.event.wheelDeltaY);
	isDeltaX = isFiniteNumber(this.event.deltaX);
	isDeltaY = isFiniteNumber(this.event.deltaY);
	isShiftKey = this.event.shiftKey;
	isCtrlKey = this.event.ctrlKey;
	wheelDelta = toFiniteNumber(this.event.wheelDelta);
	wheelDeltaX = toFiniteNumber(this.event.wheelDeltaX);
	wheelDeltaY = toFiniteNumber(this.event.wheelDeltaY);
	deltaX = toFiniteNumber(this.event.deltaX);
	deltaY = toFiniteNumber(this.event.deltaY);
	deltaMode = this.getDeltaMode(this.event);

	constructor(public event: ChromeWheelEvent) {}

	private getDeltaMode(event: WheelEvent): DeltaMode {
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

	getTouchpadPanDeltaX(): number {
		const { isWheelDeltaX, wheelDeltaX, isDeltaX, deltaX } = this;
		return isDeltaX ? -deltaX : isWheelDeltaX ? wheelDeltaX / 3 : 0;
	}

	getTouchpadPanDeltaY(): number {
		const { isWheelDeltaY, wheelDelta, wheelDeltaY, isDeltaY, deltaY } =
			this;
		return isDeltaY
			? -deltaY
			: isWheelDeltaY
			? wheelDeltaY / 3
			: wheelDelta / 3;
	}

	getTouchpadPinchMultiplier(): number {
		return Math.exp(this.getTouchpadPanDeltaY() / 100);
	}

	getWheelScaleMultiplier(): number {
		const { isWheelDelta, wheelDelta, isDeltaY, deltaX, deltaY } = this;
		const delta = isWheelDelta
			? Math.abs(wheelDelta) * 0.001 + 1
			: isDeltaY
			? Math.abs(deltaY) * 0.02 + 1
			: Math.abs(deltaX) * 0.02 + 1;
		const isIn = isWheelDelta ? wheelDelta > 0 : deltaY < 0;
		return isIn ? delta : 1 / delta;
	}

	isProbablyTouchpadPanHorisontal(): boolean {
		return this.isShiftKey && this.getTouchpadPanDeltaY() !== 0;
	}

	isTouchpadPinch(): boolean {
		return this.isCtrlKey;
	}

	isProbablyMouseWheel(): boolean {
		const { isWheelDelta, wheelDelta, deltaMode, isCtrlKey, deltaY } = this;
		detector.handle(wheelDelta);
		const isChromeMouseWheel = !isCtrlKey && detector.isMouseWheel;
		const isSafariMouseWheel = isSafari() && wheelDelta !== -deltaY * 3;
		return isWheelDelta
			? isChromeMouseWheel || isSafariMouseWheel
			: deltaMode !== "pixel";
	}

	isIgnore(): boolean {
		return detector.isIgnore;
	}
}
