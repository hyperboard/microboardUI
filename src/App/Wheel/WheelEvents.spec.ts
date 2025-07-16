import { mockWheelData } from "./mockedWheelData";
import { ChromeWheelEvent, createWheel } from "./Wheel";

describe("WheelEventLogger", () => {
  const testCases = [
    {
      system: "linux",
      type: "pan",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "linux",
      type: "pan",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "linux",
      type: "pan",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "linux",
      type: "pan",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "linux",
      type: "mouse",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "linux",
      type: "mouse",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "linux",
      type: "mouse",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "linux",
      type: "mouse",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "windows",
      type: "pan",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "windows",
      type: "pan",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "windows",
      type: "pan",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "windows",
      type: "pan",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "windows",
      type: "pan",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "windows",
      type: "pan",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "chrome",
      speed: "fastFailed",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "chrome",
      speed: "defaultFailed",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "windows",
      type: "pinch",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "windows",
      type: "mouse",
      browsers: "firefox",
      speed: "defaultFailed",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "safari",
      speed: "slow",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "safari",
      speed: "fast",
    },
    {
      system: "mac",
      type: "pan",
      browsers: "safari",
      speed: "default",
    },
    {
      system: "mac",
      type: "pinch",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "mac",
      type: "pinch",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "mac",
      type: "pinch",
      browsers: "safari",
      speed: "default",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "safari",
      speed: "slow",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "safari",
      speed: "fast",
    },
    {
      system: "mac",
      type: "mousePan",
      browsers: "safari",
      speed: "default",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "chrome",
      speed: "slow",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "chrome",
      speed: "fast",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "chrome",
      speed: "fastFailed",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "chrome",
      speed: "default",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "firefox",
      speed: "slow",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "firefox",
      speed: "fast",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "firefox",
      speed: "default",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "safari",
      speed: "slow",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "safari",
      speed: "slowFailed",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "safari",
      speed: "fast",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "safari",
      speed: "fastFailed",
    },
    {
      system: "mac",
      type: "mousePinch",
      browsers: "safari",
      speed: "default",
    },
  ];

  function runWheelTest(
    type: string,
    browser: string,
    system: string,
    speed: string,
  ): void {
    test(`${speed} ${type} on ${system} ${browser}`, () => {
      mockWheelData[system][type][browser][speed].forEach((event) => {
        const wheel = createWheel({
          event,
          ctrlKey: event.isCtrlKey,
        } as unknown as ChromeWheelEvent);

        const isMouseWheel = wheel.isProbablyMouseWheel();
        const isTouchpadPinch = wheel.isTouchpadPinch();
        const isTouchpad = !(isMouseWheel && isTouchpadPinch);
        const isPinch =
          type === "mouse" || type === "mousePinch"
            ? isMouseWheel && isTouchpadPinch
            : isTouchpadPinch;

        const expected =
          type === "pinch" || type === "mousePinch" ? isPinch : isTouchpad;

        if (!expected) {
          console.error(`❌ Test failed! Event:`, event);
        }

        expect(expected).toBe(true);
      });
    });
  }

  testCases.forEach(({ system, type, browsers, speed }) => {
    runWheelTest(type, browsers, system, speed);
  });
});
