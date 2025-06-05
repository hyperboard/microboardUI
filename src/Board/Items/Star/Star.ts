import { BaseItem } from "Board/Items/BaseItem/BaseItem";
import { Board } from "Board/Board";
import { DrawingContext } from "Board/Items/DrawingContext";
import { DocumentFactory } from "Board/api/DocumentFactory";
import { ItemOperation, Operation } from "Board/Events";
import { Point } from "Board/Items/Point/Point";
import { BorderStyle, BorderWidth, Path } from "Board/Items/Path/Path";
import { Line } from "Board/Items/Line/Line";
import { Subject } from "shared/Subject";
import {
	DefaultTransformationData,
	TransformationData,
} from "Board/Items/Transformation/TransformationData";
import { Paths } from "Board/Items/Path/Paths";
import { Item, ItemData } from "Board/Items/Item";
import { registerItem } from "Board/Items/RegisterItem";
import { StarOperation } from "Board/Items/Star/StarOperation";
import { StarCommand } from "Board/Items/Star/StarCommand";
import { AddStar } from "Board/Items/Star/AddStar";

export interface StarData {
	readonly itemType: "Star";
	backgroundColor: string;
	backgroundOpacity: number;
	borderColor: string;
	borderOpacity: number;
	borderStyle: BorderStyle;
	borderWidth: BorderWidth;
	transformation: TransformationData;
	linkTo?: string;
}

export class DefaultStarData implements StarData {
	readonly itemType = "Star";
	constructor(
		public backgroundColor = "#1f1255",
		public backgroundOpacity = 1,
		public borderColor = "#000207",
		public borderOpacity = 1,
		public borderStyle: BorderStyle = "solid",
		public borderWidth: BorderWidth = 1,
		public transformation = new DefaultTransformationData(),
		public linkTo?: string,
	) {}
}

const starPath = new Path(
	[
		new Line(new Point(0, 35), new Point(35, 35)),
		new Line(new Point(35, 35), new Point(50, 0)),
		new Line(new Point(50, 0), new Point(65, 35)),
		new Line(new Point(65, 35), new Point(100, 35)),
		new Line(new Point(100, 35), new Point(75, 60)),
		new Line(new Point(75, 60), new Point(90, 95)),
		new Line(new Point(90, 95), new Point(50, 75)),
		new Line(new Point(50, 75), new Point(10, 95)),
		new Line(new Point(10, 95), new Point(25, 60)),
		new Line(new Point(25, 60), new Point(0, 35)),
	],
	true,
);

const defaultStarData = new DefaultStarData();

export class Star extends BaseItem {
	readonly itemType = "Star";
	private path: Path;
	readonly subject = new Subject<Star>();
	private borderWidth = 1;
	isShining = false;

	constructor(
		board: Board,
		id = "",
		backgroundColor = defaultStarData.backgroundColor,
		backgroundOpacity = defaultStarData.backgroundOpacity,
		borderColor = defaultStarData.borderColor,
		borderOpacity = defaultStarData.borderOpacity,
		borderStyle = defaultStarData.borderStyle,
		borderWidth = defaultStarData.borderWidth,
	) {
		super(board, id);

		this.path = starPath.copy();
		this.path.setBackgroundColor(backgroundColor);
		this.path.setBackgroundOpacity(backgroundOpacity);
		this.path.setBorderColor(borderColor);
		this.path.setBorderOpacity(borderOpacity);
		this.path.setBorderStyle(borderStyle);
		this.path.setBorderWidth(borderWidth);
		this.borderWidth = borderWidth;

		this.transformation.subject.subscribe(() => {
			this.transformPath();
			this.updateMbr();
			this.subject.publish(this);
		});

		this.updateMbr();
	}

	private transformPath(): void {
		this.path = starPath.copy();
		this.path.transform(this.transformation.matrix);

		this.path.setBackgroundColor(this.backgroundColor);
		this.path.setBorderColor(this.borderColor);
		this.path.setBorderWidth(this.borderWidth);
		this.path.setBorderStyle(this.borderStyle);
	}

	render(context: DrawingContext): void {
		if (this.transformationRenderBlock) {
			return;
		}
		this.path.render(context);
		if (this.getLinkTo()) {
			const { top, right } = this.getMbr();
			this.linkTo.render(
				context,
				top,
				right,
				this.board.camera.getScale(),
			);
		}
	}

	updateMbr(): void {
		const { left, top, right, bottom } = this.path.getMbr();
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}

	getPath(): Path | Paths {
		return this.path.copy();
	}

	renderHTML(documentFactory: DocumentFactory): HTMLElement {
		const div = documentFactory.createElement("star-item");
		const { translateX, translateY, scaleX, scaleY } =
			this.transformation.matrix;
		const mbr = this.getMbr();
		const unscaledWidth = mbr.getWidth() / scaleX;
		const unscaledHeight = mbr.getHeight() / scaleY;

		const svg = documentFactory.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		svg.setAttribute("width", `${unscaledWidth}px`);
		svg.setAttribute("height", `${unscaledHeight}px`);
		svg.setAttribute("viewBox", `0 0 ${unscaledWidth} ${unscaledHeight}`);
		svg.setAttribute("transform-origin", "0 0");
		svg.setAttribute("transform", `scale(${1 / scaleX}, ${1 / scaleY})`);
		svg.setAttribute("style", "position: absolute; overflow: visible;");

		const pathElement = this.path.renderHTML(documentFactory);
		svg.appendChild(pathElement);
		div.appendChild(svg);

		div.id = this.getId();
		div.style.width = `${unscaledWidth}px`;
		div.style.height = `${unscaledHeight}px`;
		div.style.transformOrigin = "left top";
		div.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
		div.style.position = "absolute";

		return div;
	}

	serialize(): StarData {
		return {
			itemType: "Star",
			backgroundColor: this.path.getBackgroundColor(),
			backgroundOpacity: this.path.getBackgroundOpacity(),
			borderColor: this.path.getBorderColor(),
			borderOpacity: this.path.getBorderOpacity(),
			borderStyle: this.path.getBorderStyle(),
			borderWidth: this.path.getBorderWidth(),
			transformation: this.transformation.serialize(),
			linkTo: this.linkTo.serialize() || undefined,
		};
	}

	deserialize(data: Partial<StarData>): this {
		if (data.transformation) {
			this.transformation.deserialize(data.transformation);
		}
		if (data.linkTo) {
			this.linkTo.deserialize(data.linkTo);
		}

		this.path = starPath.copy();
		if (data.backgroundColor) {
			this.path.setBackgroundColor(data.backgroundColor);
		}
		if (data.backgroundOpacity) {
			this.path.setBackgroundOpacity(data.backgroundOpacity);
		}
		if (data.borderColor) {
			this.path.setBorderColor(data.borderColor);
		}
		if (data.borderOpacity) {
			this.path.setBorderOpacity(data.borderOpacity);
		}
		if (data.borderStyle) {
			this.path.setBorderStyle(data.borderStyle);
		}
		if (data.borderWidth) {
			this.path.setBorderWidth(data.borderWidth);
		}

		this.transformPath();
		this.subject.publish(this);
		return this;
	}

	isClosed(): boolean {
		return true;
	}

	emit(operation: StarOperation): void {
		if (this.board.events) {
			const command = new StarCommand([this], operation);
			command.apply();
			this.board.events.emit(operation, command);
		} else {
			this.apply(operation);
		}
	}

	toggleIsShining(): void {
		this.emit({
			class: "Star",
			method: "toggleShine",
			item: [this.getId()],
		});
	}

	apply(op: Operation): void {
		switch (op.class) {
			case "Star":
				switch (op.method) {
					case "toggleShine":
						if (!this.isShining) {
							this.backgroundColor = "#ddc990";
							this.borderColor = "#f6bb0e";
						} else {
							this.backgroundColor = "#1f1255";
							this.borderColor = "#000207";
						}
						this.isShining = !this.isShining;
						this.transformPath();
				}
				break;
			case "Transformation":
				this.transformation.apply(op);
				break;
			case "LinkTo":
				this.linkTo.apply(op);
				break;
		}
		this.subject.publish(this);
	}
}

function createStar(id: string, data: ItemData, board: Board): Star {
	if (data.itemType !== "Star") {
		throw new Error("Invalid data for Star");
	}
	const star = new Star(board, id).setId(id).deserialize(data);
	return star;
}

function validateStarData(starData: any): boolean {
	const isValid =
		starData.hasOwnProperty("backgroundColor") &&
		starData.hasOwnProperty("borderColor") &&
		starData.hasOwnProperty("borderStyle") &&
		starData.hasOwnProperty("borderWidth") &&
		starData.hasOwnProperty("transformation") &&
		typeof starData.backgroundColor === "string" &&
		typeof starData.borderColor === "string" &&
		typeof starData.borderStyle === "string" &&
		typeof starData.borderWidth === "number";
	return isValid;
}

function createStarCommand(
	items: Item[],
	operation: ItemOperation,
): StarCommand {
	return new StarCommand(
		items.filter((item): item is Star => item.itemType === "Star"),
		operation as StarOperation,
	);
}

registerItem({
	itemFactory: createStar,
	validator: validateStarData,
	itemType: "Star",
	commandFactory: createStarCommand,
	toolData: { name: "AddStar", tool: new AddStar(new Board(), "AddStar") },
});
