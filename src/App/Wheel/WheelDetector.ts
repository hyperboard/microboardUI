const maxLogSize = 10;
const detectionFrequency = 8;
const highDeltaMouseWheel = 50;
const debugEnabled = false;

export class WheelDetector {
	private log: number[] = [];

	isMouseWheel = true;
	isIgnore = false;

	wheelDeltaConstant: number | undefined;
	highDeltaPrevious: number | undefined;

	constructor() {
		if (maxLogSize < detectionFrequency) {
			throw new Error(`WheelDetector: bad settings, maxLogSize (${maxLogSize}) most be > detectionFrequency (${detectionFrequency})`)
		}
	}

	handle(wheelDelta: number): void {
		const absWheelDelta = Math.abs(wheelDelta);

		this.log.push(absWheelDelta);

		if (this.log.length > maxLogSize) {
			this.log.shift();
		}

		let isMouseWheel = true;

		// calculate wheelDeltaConstant only if current wheelDelta is high
		if (absWheelDelta >= highDeltaMouseWheel) {
			let frequency = 0;

			for (const value of this.log) {
				if (value === absWheelDelta) {
					frequency++;
				}
			}

			if (frequency >= detectionFrequency) {
				this.wheelDeltaConstant = absWheelDelta
				this.clearHighDeltaPrevious();

				if (debugEnabled) {
					console.info(`WheelDetector: wheelDeltaConstant = ${absWheelDelta}
					frequency: ${frequency} in log: ${this.log}`);
				}
			}
		}

		if (this.wheelDeltaConstant) {
			if (this.isMouseDelta(absWheelDelta, this.wheelDeltaConstant)) {
				isMouseWheel = true;
				if (debugEnabled && !this.isMouseWheel) {
					console.info("TOUCHPAD -> WHEEL: EQUAL with wheelFrequencyConstant")
				}
			} else {
				isMouseWheel = false;
				if (debugEnabled && this.isMouseWheel) {
					console.info("WHEEL -> TOUCHPAD: NOT EQUAL with wheelFrequencyConstant")
				}
			}
		} else {
			if (absWheelDelta > highDeltaMouseWheel) {
				if (!this.highDeltaPrevious) {
					this.highDeltaPrevious = absWheelDelta;
					this.isIgnore = true;
					if (debugEnabled) {
						console.info(`WheelDetector: IGNORED, set highDeltaPrevious = ${absWheelDelta}`)
					}
				} else {
					if (this.isMouseDelta(absWheelDelta, this.highDeltaPrevious)) {
						isMouseWheel = true;
						if (debugEnabled && !this.isMouseWheel) {
							console.info("TOUCHPAD -> WHEEL: EQUAL with highDeltaPrevious");
						}
					} else {
						isMouseWheel = false;
						if (debugEnabled && this.isMouseWheel) {
							console.info("WHEEL -> TOUCHPAD: NOT EQUAL with highDeltaPrevious")
						}
					}
					this.clearHighDeltaPrevious();
				}
			} else {
				isMouseWheel = false;
				if (debugEnabled && this.isMouseWheel) {
					console.info(`WHEEL -> TOUCHPAD: incoming delta (${absWheelDelta}) < highDeltaMouseWheel (${highDeltaMouseWheel})`)
				}
				this.clearHighDeltaPrevious();
			}
		}

		this.isMouseWheel = isMouseWheel;
	}

	isMouseDelta(absWheelDelta: number, wheelConstant: number): boolean {
		return absWheelDelta === wheelConstant || absWheelDelta % wheelConstant === 0
	}

	private clearHighDeltaPrevious(): void {
		this.isIgnore = false;
		this.highDeltaPrevious = undefined;
	}

}
