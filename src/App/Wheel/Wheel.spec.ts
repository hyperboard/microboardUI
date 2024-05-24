import { createWheel } from "./Wheel";

describe("to diagram, a user", () => {
	test("pans by sliding 2 fingers on a trackpad", () => {
		let wheel = createWheel({} as WheelEvent);
		wheel.isWheelDelta = true;
		wheel.isWheelDeltaX = true;
		wheel.isWheelDeltaY = true;
		wheel.isDeltaX = true;
		wheel.isDeltaY = true;
		wheel.isShiftKey = false;
		wheel.isCtrlKey = false;
		wheel.wheelDelta = -4;
		wheel.wheelDeltaX = 0;
		wheel.wheelDeltaY = -4;
		wheel.deltaX = 0;
		wheel.deltaY = 4.5;
		wheel.deltaMode = "pixel";

		wheel = createWheel({} as WheelEvent);
		wheel.isWheelDelta = true;
		wheel.isWheelDeltaX = true;
		wheel.isWheelDeltaY = true;
		wheel.isDeltaX = true;
		wheel.isDeltaY = true;
		wheel.isShiftKey = false;
		wheel.isCtrlKey = false;
		wheel.wheelDelta = -1;
		wheel.wheelDeltaX = 0;
		wheel.wheelDeltaY = -1;
		wheel.deltaX = 0;
		wheel.deltaY = 1.5;
		wheel.deltaMode = "pixel";
		expect(wheel.isProbablyMouseWheel()).toBe(false);
	});

	test("zooms the board by pinching the trackpad", () => {
		// Implementation for zooming test
	});
});
