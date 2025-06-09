import { Mbr } from "Board/Items/Mbr/Mbr";
import { Geometry } from "Board/Items/Geometry";
import { RichText } from "Board/Items/RichText/RichText";
import { LinkTo } from "Board/Items/LinkTo/LinkTo";
import { Transformation } from "Board/Items/Transformation/Transformation";
import { Board } from "Board/Board";
import { DrawingContext } from "Board/Items/DrawingContext";
import { DocumentFactory } from "Board/api/DocumentFactory";
import { Operation } from "Board/Events";

export abstract class BaseItem extends Mbr implements Geometry {
	readonly transformation: Transformation;
	readonly linkTo: LinkTo;
	readonly parent: string = "Board";
	transformationRenderBlock?: boolean = undefined;
	board: Board;
	id: string;
	shouldUseCustomRender = false;
	shouldRenderOutsideViewRect = true;

	constructor(board: Board, id = "") {
		super();
		this.board = board;
		this.id = id;
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

	abstract apply(op: Operation): void;
	abstract render(context: DrawingContext): void;
	abstract renderHTML(documentFactory: DocumentFactory): HTMLElement;
	abstract serialize(): any;
	abstract deserialize(data: any): this;

	isClosed() {
		return true;
	}
}
