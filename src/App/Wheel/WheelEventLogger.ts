import { ChromeWheelEvent } from "./Wheel";

export type LogEntryType = {
	deltaX: number;
	deltaY: number;
	deltaZ: number;
	wheelDeltaX?: number;
	wheelDeltaY?: number;
	deltaMode: number;
	userAgent: string;
	devicePixelRatio: number;
	platform: string;
	isCtrlKey: boolean;
	isShiftKey: boolean;
};

export class WheelEventLogger {
	private setEvents: React.Dispatch<React.SetStateAction<any[]>>;
	private setMousePosition: React.Dispatch<
		React.SetStateAction<{ x: number; y: number }>
	>;

	constructor(
		setEvents: React.Dispatch<React.SetStateAction<any[]>>,
		setMousePosition: React.Dispatch<
			React.SetStateAction<{ x: number; y: number }>
		>,
	) {
		this.setEvents = setEvents;
		this.setMousePosition = setMousePosition;
		this.init();
	}

	private init(): void {
		window.addEventListener("wheel", this.logEvent);
		window.addEventListener("mousemove", this.updateMousePosition);
	}

	private logEvent = (event: ChromeWheelEvent): void => {
		const logEntry: LogEntryType = {
			deltaX: event.deltaX,
			deltaY: event.deltaY,
			deltaZ: event.deltaZ,
			wheelDeltaX: event.wheelDeltaX,
			wheelDeltaY: event.wheelDeltaY,
			deltaMode: event.deltaMode,
			userAgent: navigator.userAgent,
			devicePixelRatio: window.devicePixelRatio,
			platform: navigator.platform,
			isCtrlKey: event.ctrlKey || event.metaKey,
			isShiftKey: event.shiftKey,
		};
		this.setEvents(prev => [logEntry, ...prev]);
	};

	private updateMousePosition = (event: MouseEvent): void => {
		this.setMousePosition({ x: event.clientX, y: event.clientY });
	};

	cleanup(): void {
		window.removeEventListener("wheel", this.logEvent);
		window.removeEventListener("mousemove", this.updateMousePosition);
	}
}
