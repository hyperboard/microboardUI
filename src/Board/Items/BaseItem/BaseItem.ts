import { Mbr } from "Board/Items/Mbr/Mbr";
import { Geometry } from "Board/Items/Geometry";
import { RichText } from "Board/Items/RichText/RichText";
import { LinkTo } from "Board/Items/LinkTo/LinkTo";
import { Transformation } from "Board/Items/Transformation/Transformation";
import { Board } from "Board/Board";
import { DrawingContext } from "Board/Items/DrawingContext";
import { DocumentFactory } from "Board/api/DocumentFactory";
import { Operation } from "Board/Events";
import { TransformationData } from "Board/Items/Transformation/TransformationData";

export type BaseItemData = { itemType: string } & Record<string, any>;
export type SerializedItemData<T extends BaseItemData = BaseItemData> = {
	linkTo?: string;
	transformation: TransformationData;
} & T;

export abstract class BaseItem extends Mbr implements Geometry {
	readonly transformation: Transformation;
	readonly linkTo: LinkTo;
	readonly parent: string = "Board";
	transformationRenderBlock?: boolean = undefined;
	board: Board;
	id: string;
	shouldUseCustomRender = false;
	shouldRenderOutsideViewRect = true;
	itemType: string = "";

	constructor(
		board: Board,
		id = "",
		private defaultItemData?: BaseItemData,
	) {
		super();
		this.board = board;
		this.id = id;
		if (defaultItemData) {
			Object.entries(defaultItemData).forEach(([key, value]) => {
				this[key] = value;
			});
		}
		this.linkTo = new LinkTo(this.id, this.board.events);
		this.transformation = new Transformation(this.id, this.board.events);
	}

	getId(): string {
		return this.id;
	}

	setId(id: string): this {
		this.id = id;
		this.transformation.setId(id);
		this.linkTo.setId(id);
		this.getRichText()?.setId(id);
		return this;
	}

	getLinkTo(): string | undefined {
		return this.linkTo.link;
	}

	getRichText(): RichText | null {
		return null;
	}

	emit(operation: Operation): void {
		this.board.events.emit(operation);
	}

	deserialize(data: SerializedItemData): this {
		Object.entries(data).forEach(([key, value]) => {
			if (this[key]?.deserialize) {
				this[key].deserialize(value);
			} else {
				this[key] = value;
			}
		});

		return this;
	}

	serialize(): SerializedItemData {
		const serializedData: SerializedItemData = {
			linkTo: this.linkTo.serialize(),
			transformation: this.transformation.serialize(),
			itemType: this.defaultItemData.itemType,
		};
		Object.keys(this.defaultItemData).forEach((key: string) => {
			const value = this[key];
			serializedData[key] = value?.serialize?.() || value;
		});

		return serializedData;
	}

	isClosed() {
		return true;
	}

	apply(op: Operation): void {
		switch (op.class) {
			case "Transformation":
				this.transformation.apply(op);
				break;
			case "LinkTo":
				this.linkTo.apply(op);
				break;
		}
	}

	abstract render(context: DrawingContext): void;
	abstract renderHTML(documentFactory: DocumentFactory): HTMLElement;
}
