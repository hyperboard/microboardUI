import { Board } from "Board/Board";
import { CustomTool, StickerTool } from "Board/Tools/CustomTool";
import {
	Counter,
	COUNTER_DIMENSIONS,
} from "Board/Items/Examples/Counter/Counter";

export class AddCounter extends StickerTool {
	constructor(board: Board, name: string) {
		super(board, name, Counter, { width: 250, height: 250 });
	}

	override keyDown(key: string): boolean {
		const result = super.keyDown(key);
		if (result) {
			return result;
		}
		if (key === " ") {
			this.createCounterInCenter();
			return true;
		}
		return false;
	}

	createCounterInCenter(): void {
		const { left, top, bottom, right } = this.board.camera.getMbr();
		const x = (left + right) / 2 - COUNTER_DIMENSIONS.width / 2;
		const y = (top + bottom) / 2 - COUNTER_DIMENSIONS.height / 2;
		const counter = new Counter(this.board, "");
		counter.transformation.apply({
			class: "Transformation",
			method: "translateTo",
			item: [counter.getId()],
			x,
			y,
		});
		const addedCounter = this.board.add(counter);
		this.board.selection.add(addedCounter);
	}
}
