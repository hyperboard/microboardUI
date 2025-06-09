import { BoardTool } from "Board/Tools/BoardTool";
import { Board } from "Board/Board";

export class CustomTool extends BoardTool {
	constructor(
		board: Board,
		public name: string,
	) {
		super(board);
	}
}
