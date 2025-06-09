import { BaseItem } from "Board/Items/BaseItem/BaseItem";
import { Board } from "Board/Board";
import { DrawingContext } from "Board/Items/DrawingContext";
import { DocumentFactory } from "Board/api/DocumentFactory";
import { ItemOperation, Operation } from "Board/Events/index";
import { Point } from "Board/Items/Point/Point";
import { Path } from "Board/Items/Path/Path";
import { Line } from "Board/Items/Line/Line";
import { Subject } from "shared/Subject";
import {
	DefaultTransformationData,
	TransformationData,
} from "Board/Items/Transformation/TransformationData";
import { Paths } from "Board/Items/Path/Paths";
import { Item, ItemData } from "Board/Items/Item";
import { registerItem } from "Board/Items/RegisterItem";
import { CounterOperation } from "Board/Items/Examples/Counter/CounterOperation";
import { CounterCommand } from "Board/Items/Examples/Counter/CounterCommand";
import { AddCounter } from "Board/Items/Examples/Counter/AddCounter";

export interface CounterData {
	readonly itemType: "Counter";
	count: number;
	linkTo?: string;
	transformation: TransformationData;
}

export class DefaultCounterData implements CounterData {
	readonly itemType = "Counter";
	constructor(
		public count = 0,
		public linkTo?: string,
		public transformation = new DefaultTransformationData(),
	) {}
}

export const COUNTER_DIMENSIONS = { width: 200, height: 200 };

const defaultPhotoData = new DefaultCounterData();

export class Counter extends BaseItem {
	readonly itemType = "Counter";
	private count = 0;
	readonly subject = new Subject<Counter>();
	shouldUseCustomRender = true;

	constructor(board: Board, id = "") {
		super(board, id);

		this.transformation.subject.subscribe(() => {
			this.updateMbr();
			this.subject.publish(this);
		});

		this.updateMbr();
	}

	render(context: DrawingContext): void {
		if (this.transformationRenderBlock) {
			return;
		}
		const ctx = context.ctx;
		ctx.save();
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillRect(this.left, this.top, this.getWidth(), this.getHeight());
		ctx.restore();
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
		const { translateX, translateY, scaleX, scaleY } =
			this.transformation.matrix;
		this.left = translateX;
		this.top = translateY;
		this.right = this.left + COUNTER_DIMENSIONS.width * scaleX;
		this.bottom = this.top + COUNTER_DIMENSIONS.height * scaleY;
	}

	getPath(): Path | Paths {
		const { top, right, bottom, left } = this.getMbr();
		return new Path([
			new Line(new Point(left, top), new Point(right, top)),
			new Line(new Point(right, top), new Point(right, bottom)),
			new Line(new Point(right, bottom), new Point(left, bottom)),
			new Line(new Point(left, bottom), new Point(left, top)),
		]);
	}

	renderHTML(documentFactory: DocumentFactory): HTMLElement {
		const div = documentFactory.createElement("photo-item");
		return div;
	}

	serialize(): CounterData {
		return {
			itemType: "Counter",
			count: this.count,
			linkTo: this.linkTo.serialize(),
			transformation: this.transformation.serialize(),
		};
	}

	deserialize(data: Partial<CounterData>): this {
		if (data.transformation) {
			this.transformation.deserialize(data.transformation);
		}
		if (data.linkTo) {
			this.linkTo.deserialize(data.linkTo);
		}
		if (data.count) {
			this.count = data.count;
		}

		this.updateMbr();
		this.subject.publish(this);
		return this;
	}

	emit(operation: CounterOperation): void {
		if (this.board.events) {
			const command = new CounterCommand([this], operation);
			command.apply();
			this.board.events.emit(operation, command);
		} else {
			this.apply(operation);
		}
	}

	getCount(): number {
		return this.count;
	}

	setCount(count: number): void {
		this.emit({
			class: "Counter",
			method: "updateCounter",
			item: [this.getId()],
			newState: { counter: count },
			prevState: { counter: this.count },
		});
	}

	apply(op: Operation): void {
		switch (op.class) {
			case "Counter":
				switch (op.method) {
					case "updateCounter":
						this.count = op.newState.counter;
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

function createCounter(id: string, data: ItemData, board: Board): Counter {
	if (data.itemType !== "Counter") {
		throw new Error("Invalid data for Counter");
	}
	const counter = new Counter(board, id).setId(id).deserialize(data);
	return counter;
}

function validateCounterData(counterData: any): boolean {
	const isValid =
		counterData.hasOwnProperty("count") &&
		typeof counterData.count === "number";
	return isValid;
}

function createCounterCommand(
	items: Item[],
	operation: ItemOperation,
): CounterCommand {
	return new CounterCommand(
		items.filter((item): item is Counter => item.itemType === "Counter"),
		operation as CounterOperation,
	);
}

registerItem({
	itemFactory: createCounter,
	validator: validateCounterData,
	itemType: "Counter",
	commandFactory: createCounterCommand,
	toolData: { name: "AddCounter", tool: AddCounter },
});
