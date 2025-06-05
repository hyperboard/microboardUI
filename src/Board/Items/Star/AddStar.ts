import { Board } from "Board/Board";
import { Line, Mbr, Point } from "Board/Items";
import { DrawingContext } from "Board/Items/DrawingContext";
import { ResizeType } from "Board/Selection/Transformer/TransformerHelpers/getResizeType";
import { conf } from "Board/Settings";
import { CustomTool } from "Board/Tools/CustomTool";
import { Star } from "Board/Items/Star/Star";

export class AddStar extends CustomTool {
	line: Line | undefined;
	resizeType: ResizeType = "leftBottom";
	bounds = new Mbr();
	item: Star;
	isDown = false;

	constructor(board: Board, name: string) {
		super(board, name);
		this.setCursor();
		this.item = new Star(board, "");
	}

	setCursor(): void {
		this.board.pointer.setCursor("crosshair");
	}

	initTransformation(sx?: number, sy?: number): void {
		sx = sx || this.bounds.getWidth() / 100;
		sy = sy || this.bounds.getHeight() / 100;
		this.item.transformation.apply({
			class: "Transformation",
			method: "translateTo",
			item: [this.item.getId()],
			x: this.bounds.left,
			y: this.bounds.top,
		});
		this.item.transformation.apply({
			class: "Transformation",
			method: "scaleTo",
			item: [this.item.getId()],
			x: sx,
			y: sy,
		});
	}

	leftButtonDown(): boolean {
		this.isDown = true;
		const point = this.board.pointer.point;
		this.line = new Line(point.copy(), point.copy());
		this.bounds = this.line.getMbr();
		this.bounds.borderColor = "#d10b0b";
		this.initTransformation();
		this.board.tools.publish();
		return true;
	}

	pointerMoveBy(_x: number, _y: number): boolean {
		if (this.line) {
			const startPoint = this.line.start.copy();
			const endPoint = this.board.pointer.point.copy();

			if (this.board.keyboard.isShift) {
				const deltaX = endPoint.x - startPoint.x;
				const deltaY = endPoint.y - startPoint.y;
				const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
				endPoint.x = startPoint.x + Math.sign(deltaX) * maxDelta;
				endPoint.y = startPoint.y + Math.sign(deltaY) * maxDelta;
			}

			this.line = new Line(startPoint, endPoint);
			this.bounds = this.line.getMbr();
			this.bounds.borderColor = "#d10b0b";
			this.initTransformation();
			this.board.tools.publish();
			return true;
		}

		return false;
	}

	leftButtonUp(): boolean {
		const width = this.bounds.getWidth() < 2 ? 100 : this.bounds.getWidth();
		const height =
			this.bounds.getHeight() < 2 ? 100 : this.bounds.getHeight();
		this.initTransformation(width / 100, height / 100);
		const star = this.board.add(this.item);
		this.isDown = false;
		this.board.selection.removeAll();
		this.board.selection.add(star);
		this.board.tools.publish();

		return true;
	}

	keyDown(key: string): boolean {
		if (key === "Escape") {
			this.board.tools.select();
			return true;
		} else if (key === " ") {
			this.createStarInRandomPlace();
			return true;
		}
		return false;
	}

	middleButtonDown(): boolean {
		this.board.tools.navigate();
		const navigate = this.board.tools.getNavigate();
		if (!navigate) {
			return false;
		}
		navigate.returnToTool = this.returnToTool;
		navigate.middleButtonDown();
		return true;
	}

	rightButtonDown(): boolean {
		this.board.tools.navigate();
		const navigate = this.board.tools.getNavigate();
		if (!navigate) {
			return false;
		}
		navigate.returnToTool = this.returnToTool;
		navigate.rightButtonDown();
		return true;
	}

	returnToTool = (): void => {
		this.board.tools.setTool(this);
		this.setCursor();
	};

	createStarInRandomPlace(): void {
		const { left, top, bottom, right } = this.board.camera.getMbr();
		const viewWidth = right - left;
		const viewHeight = bottom - top;
		const x = left + Math.random() * viewWidth;
		const y = top + Math.random() * viewHeight;
		this.bounds = new Mbr(x, y, x, y);
		this.line = new Line(new Point(x, y), new Point(x, y));
		this.bounds.borderColor = conf.SELECTION_COLOR;
		this.initTransformation();
		this.board.tools.publish();
		this.leftButtonUp();
	}

	render(context: DrawingContext): void {
		if (this.isDown) {
			this.item.render(context);
			this.bounds.render(context);
		}
	}
}
