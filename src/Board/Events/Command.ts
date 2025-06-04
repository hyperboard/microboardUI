import { Board } from "Board";
import { ShapeCommand } from "Board/Items/Shape/ShapeCommand";
import { BoardCommand } from "../BoardCommand";
import { TransformationCommand } from "../Items/Transformation/TransformationCommand";
import {
	RichTextCommand,
	RichTextGroupCommand,
} from "../Items/RichText/RichTextCommand";
import { EventsCommand } from "./EventsCommand";
import { ConnectorCommand } from "Board/Items/Connector/ConnectorCommand";
import { ItemOperation, Operation } from "./EventsOperations";
import { DrawingCommand } from "Board/Items/Drawing/DrawingCommand";
import { StickerCommand } from "../Items/Sticker/StickerCommand";
import {
	Connector,
	ConnectorOperation,
	Frame,
	Item,
	RichText,
	RichTextOperation,
	Shape,
	TransformationOperation,
} from "Board/Items";
import { Drawing } from "Board/Items/Drawing";
import { Sticker } from "Board/Items/Sticker";
import { FrameCommand } from "Board/Items/Frame/FrameCommand";
import { Comment, CommentCommand, CommentOperation } from "../Items/Comment";
import { LinkToCommand } from "../Items/LinkTo/LinkToCommand";
import { GroupCommand } from "Board/Items/Group/GroupCommand";
import { Group } from "Board/Items/Group";
import { PlaceholderCommand } from "Board/Items/Placeholder/PlaceholderCommand";
import { Placeholder } from "Board/Items/Placeholder";
import { ImageCommand } from "Board/Items/Image/ImageCommand";
import { ImageItem } from "Board/Items/Image";
import { VideoCommand } from "Board/Items/Video/VideoCommand";
import { VideoItem } from "Board/Items/Video/Video";
import { AudioCommand } from "Board/Items/Audio/AudioCommand";
import { AudioItem } from "Board/Items/Audio/Audio";
import { ShapeOperation } from "Board/Items/Shape/ShapeOperation";
import { DrawingOperation } from "Board/Items/Drawing/DrawingOperation";
import { StickerOperation } from "Board/Items/Sticker/StickerOperation";
import { FrameOperation } from "Board/Items/Frame/FrameOperation";
import { PlaceholderOperation } from "Board/Items/Placeholder/PlaceholderOperation";
import { GroupOperation } from "Board/Items/Group/GroupOperation";
import { LinkToOperation } from "Board/Items/LinkTo/LinkToOperation";

export interface Command {
	apply(): void;

	revert(): void;
}

export interface ItemCommandFactory {
	(
		items: Item[],
		operation: ItemOperation | TransformationOperation,
		board?: Board,
	): Command;
}

export const itemCommandFactories: Record<string, ItemCommandFactory> = {
	Sticker: createStickerCommand,
	Shape: createShapeCommand,
	RichText: createRichTextCommand,
	Connector: createConnectorCommand,
	Image: createImageCommand,
	Drawing: createDrawingCommand,
	Frame: createFrameCommand,
	Placeholder: createPlaceholderCommand,
	Comment: createCommentCommand,
	Group: createGroupCommand,
	Video: createVideoCommand,
	Audio: createAudioCommand,
	Transformation: createTransformationCommand,
	LinkTo: createLinkToCommand,
};

function createConnectorCommand(items: Item[], operation: ItemOperation) {
	return new ConnectorCommand(
		items.filter(
			(item): item is Connector => item.itemType === "Connector",
		),
		operation as ConnectorOperation,
	);
}

function createShapeCommand(items: Item[], operation: ItemOperation) {
	return new ShapeCommand(
		items.filter((item): item is Shape => item.itemType === "Shape"),
		operation as ShapeOperation,
	);
}

function createDrawingCommand(items: Item[], operation: ItemOperation) {
	return new DrawingCommand(
		items.filter((item): item is Drawing => item.itemType === "Drawing"),
		operation as DrawingOperation,
	);
}

function createCommentCommand(items: Item[], operation: ItemOperation) {
	return new CommentCommand(
		items.filter((item): item is Comment => item.itemType === "Comment"),
		operation as CommentOperation,
	);
}

function createStickerCommand(items: Item[], operation: ItemOperation) {
	return new StickerCommand(
		items.filter((item): item is Sticker => item.itemType === "Sticker"),
		operation as StickerOperation,
	);
}

function createFrameCommand(items: Item[], operation: ItemOperation) {
	return new FrameCommand(
		items.filter((item): item is Frame => item.itemType === "Frame"),
		operation as FrameOperation,
	);
}

function createPlaceholderCommand(items: Item[], operation: ItemOperation) {
	return new PlaceholderCommand(
		items.filter(
			(item): item is Placeholder => item.itemType === "Placeholder",
		),
		operation as PlaceholderOperation,
	);
}

function createGroupCommand(items: Item[], operation: ItemOperation) {
	return new GroupCommand(
		items.filter((item): item is Group => item.itemType === "Group"),
		operation as GroupOperation,
	);
}

function createImageCommand(items: Item[], operation: ItemOperation) {
	return new ImageCommand(
		items.filter((item): item is ImageItem => item.itemType === "Image"),
		operation,
	);
}

function createVideoCommand(items: Item[], operation: ItemOperation) {
	return new VideoCommand(
		items.filter((item): item is VideoItem => item.itemType === "Video"),
		operation,
	);
}

function createAudioCommand(items: Item[], operation: ItemOperation) {
	return new AudioCommand(
		items.filter((item): item is AudioItem => item.itemType === "Audio"),
		operation,
	);
}

function createRichTextCommand(
	items: Item[],
	operation: ItemOperation,
	board?: Board,
) {
	if (!board) {
		return new NoOpCommand(`Board not found`);
	}
	if (operation.method === "groupEdit") {
		const texts: RichText[] = [];
		for (const { item } of operation.itemsOps) {
			const found = board.items.findById(item);
			const text = found?.getRichText();
			if (text) {
				texts.push(text);
			}
		}
		return new RichTextGroupCommand(texts, operation);
	} else {
		return new RichTextCommand(
			board,
			items.map(item => item.getId()),
			operation as RichTextOperation,
		);
	}
}

function createTransformationCommand(items: Item[], operation: ItemOperation) {
	return new TransformationCommand(
		items.map(item => item.transformation),
		operation as TransformationOperation,
	);
}

function createLinkToCommand(items: Item[], operation: ItemOperation) {
	return new LinkToCommand(
		items.map(item => item.linkTo),
		operation as LinkToOperation,
	);
}

export function createCommand(board: Board, operation: Operation): Command {
	// TODO API
	try {
		switch (operation.class) {
			case "Events": {
				const events = board.events;
				if (!events) {
					return new NoOpCommand("Board Has No Events Record");
				}
				return new EventsCommand(board, operation);
			}
			case "Board": {
				return new BoardCommand(board, operation);
			}
			default: {
				const itemType = operation.class;
				const itemIdList =
					"item" in operation
						? Array.isArray(operation.item)
							? operation.item
							: [operation.item]
						: "items" in operation
							? Object.keys(operation.items)
							: Object.values(operation.itemsOps);

				const items = itemIdList
					.map(itemId => board.items.findById(itemId) ?? itemId)
					.filter((item): item is Item => {
						if (typeof item === "string") {
							console.warn(
								`Item with ID ${item} not found for operation ${operation.class}.${operation.method}`,
							);
							return false;
						}
						if (
							operation.class !== "Transformation" &&
							operation.class !== "RichText" &&
							operation.class !== "LinkTo" &&
							item.itemType !== operation.class
						) {
							console.warn(
								`Item with ID ${item} is not of operation type: ${itemType}.`,
							);
							return false;
						}
						return true;
					});

				switch (operation.class) {
					case "Connector":
						return itemCommandFactories["Connector"](
							items,
							operation,
						);
					case "Shape":
						return itemCommandFactories["Shape"](items, operation);
					case "Drawing":
						return itemCommandFactories["Drawing"](
							items,
							operation,
						);
					case "Comment":
						return itemCommandFactories["Comment"](
							items,
							operation,
						);
					case "Sticker":
						return itemCommandFactories["Sticker"](
							items,
							operation,
						);
					case "LinkTo":
						return itemCommandFactories["LinkTo"](items, operation);
					case "Transformation":
						return itemCommandFactories["Transformation"](
							items,
							operation,
						);
					case "RichText":
						return itemCommandFactories["RichText"](
							items,
							operation,
							board,
						);
					case "Frame":
						return itemCommandFactories["Frame"](items, operation);
					case "Placeholder":
						return itemCommandFactories["Placeholder"](
							items,
							operation,
						);
					case "Group":
						return itemCommandFactories["Group"](items, operation);
					case "Image":
						return itemCommandFactories["Image"](items, operation);
					case "Video":
						return itemCommandFactories["Video"](items, operation);
					case "Audio":
						return itemCommandFactories["Audio"](items, operation);
					default:
						return new NoOpCommand(`Unsupported command type`);
				}
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			return new NoOpCommand(error.message);
		} else {
			return new NoOpCommand(`An unknown error occurred: ${error}`);
		}
	}
}

class NoOpCommand {
	constructor(public reason: string) {}

	merge(_op: unknown): this {
		return this;
	}

	apply(): void {
		console.warn(`NoOpCommand applied due to: ${this.reason}`);
	}

	revert(): void {
		console.warn(`NoOpCommand reverted due to: ${this.reason}`);
	}
}
