import { Item } from "Board/Items/Item";
import { AINode } from "Board/Items/AINode/AINode";
import { Shape } from "Board/Items/Shape/Shape";
import { RichText } from "Board/Items/RichText/RichText";
import { Sticker } from "Board/Items/Sticker/Sticker";
import { ConnectorData } from "Board/Items/Connector/ConnectorOperations";
import { SessionStorage } from "App/SessionStorage";
import { Point } from "Board/Items/Point/Point";
import { Matrix } from "Board/Items/Transformation/Matrix";
import { Connector } from "Board/Items/Connector/Connector";
import { Mbr } from "Board/Items/Mbr/Mbr";
import { Board } from "Board/Board";
import { t } from "i18next";
import { ImageItem } from "Board/Items/Image";

export type PossibleParentNode = AINode | Shape | RichText | Sticker;

export const DEFAULT_MAX_NODE_WIDTH = 640;
const PLACEHOLDER_TEXT =
	"...............................................................................................................................................................................................";

export const getTextFromItem = (item: Item) => {
	const richText = item.getRichText();
	if (richText) {
		const textNodes = richText.editor.getText();
		if (Array.isArray(textNodes)) {
			return textNodes
				.map(paragraph => {
					if ("children" in paragraph) {
						return paragraph.children
							.map(child => child.text || "")
							.join(" ");
					}
					return "";
				})
				.join(" ")
				.trim();
		}
	}
	return "";
};

export const getIdeaFromSelection = (
	selectionItems: Item[],
): { item: PossibleParentNode; idea: string } | null => {
	if (selectionItems.length === 0) {
		return null;
	}
	for (const item of selectionItems) {
		switch (item.itemType) {
			case "AINode":
			case "RichText":
			case "Sticker":
			case "Shape":
				const text = getTextFromItem(item);
				if (text.trim().length !== 0) {
					return { item, idea: text };
				}
		}
	}
	return null;
};

export function calculateNodePosition(
	newNode: Item,
	selectedItem: PossibleParentNode,
	isResponseNode: boolean,
	board: Board,
): { newItem: Item; connectorData: ConnectorData } {
	const connectorStorage = new SessionStorage();
	const currMbr = selectedItem?.getMbr() || null;
	const currData = selectedItem?.serialize() || null;
	const newNodeData = newNode.serialize();
	const width = DEFAULT_MAX_NODE_WIDTH - DEFAULT_MAX_NODE_WIDTH / 3;
	const height = 150;

	const iterAdjustment = { x: -2 * width, y: 0 };

	const baseAdjustments = {
		translateX: currMbr.getWidth() / 2,
		translateY: height,
	};
	const adjustmentPoint = new Point(
		baseAdjustments.translateX + currMbr.left,
		baseAdjustments.translateY + currMbr.top,
	);

	if (newNodeData.itemType === "AINode") {
		newNodeData.adjustmentPoint = adjustmentPoint;
	}

	if (newNodeData.transformation) {
		if (isResponseNode) {
			newNodeData.transformation.translateX = adjustmentPoint.x;
		} else {
			newNodeData.transformation.translateX =
				baseAdjustments.translateX +
				(currData.transformation?.translateX || 0);
		}
		newNodeData.transformation.translateY =
			baseAdjustments.translateY +
			(currData?.transformation?.translateY || 0) +
			currMbr.getHeight();
	}

	const newMbr = currMbr
		.copy()
		.getTransformed(
			new Matrix(
				baseAdjustments.translateX,
				baseAdjustments.translateY + currMbr.getHeight(),
			),
		);

	let step = 1;
	while (
		board.index
			.getItemsEnclosedOrCrossed(
				newMbr.left,
				newMbr.top,
				newMbr.right,
				newMbr.bottom,
			)
			.filter(item => item.itemType !== "Connector").length > 0
	) {
		const direction = step % 2 === 0 ? -1 : 1;
		newMbr.transform(
			new Matrix(
				iterAdjustment.x * direction * step,
				iterAdjustment.y * direction * step,
			),
		);
		if (newNodeData.transformation) {
			newNodeData.transformation.translateX +=
				iterAdjustment.x * direction * step;
			newNodeData.transformation.translateY +=
				iterAdjustment.y * direction * step;
		}
		if (newNodeData.adjustmentPoint) {
			newNodeData.adjustmentPoint.transform(
				new Matrix(iterAdjustment.x * direction * step, 0),
			);
		}
		step += 1;
	}

	const newItem = board.createItem(
		board.getNewItemId(),
		newNodeData,
	) as AINode;

	newItem.transformation.translateBy(-newItem.getMbr().getWidth() / 2, 0);

	const defaultConnector = new Connector(board);
	const connectorData = defaultConnector.serialize();
	connectorData.lineStyle = "curved";

	const savedStart = connectorStorage.getConnectorPointer("start");
	if (savedStart) {
		connectorData.startPointerStyle = savedStart;
	}
	const savedEnd = connectorStorage.getConnectorPointer("end");
	if (savedEnd) {
		connectorData.endPointerStyle = savedEnd;
	}
	connectorData.text = new RichText(new Mbr()).serialize();

	return {
		newItem,
		connectorData,
	};
}

// TODO - find best practice
function calculateParentItemPosition(
	newNode: AINode,
	board: Board,
): { newItem: AINode; connectorData: ConnectorData } {
	const connectorStorage = new SessionStorage();
	const nearbyToCenterItems = board.items.getInView();

	const iterAdjustment = {
		x: DEFAULT_MAX_NODE_WIDTH / 2,
		y: -newNode.getMbr().getHeight() / 2,
	};

	const baseAdjustments = {
		translateX: DEFAULT_MAX_NODE_WIDTH,
		translateY: 0,
	};

	let step = 1;
	const cameraMbr = board.camera.getMbr();
	let nearbyItemMbr = cameraMbr.copy();

	if (nearbyToCenterItems.length) {
		nearbyItemMbr = nearbyToCenterItems[nearbyToCenterItems.length - 1]
			.getMbr()
			.copy();

		nearbyToCenterItems.forEach(item => {
			if (
				board.index.getNearestTo(
					new Point(item.getMbr().right, item.getMbr().top),
					20,
					(otherItem: Item) =>
						otherItem.itemType !== "Connector" &&
						otherItem.isInView(cameraMbr),
					DEFAULT_MAX_NODE_WIDTH,
				).length === 0
			) {
				nearbyItemMbr = item.getMbr().copy();
			}
		});
	}

	const adjustmentPoint = new Point(
		baseAdjustments.translateX + nearbyItemMbr.left,
		baseAdjustments.translateY + nearbyItemMbr.top,
	);

	const newNodeData = newNode.serialize();
	newNodeData.adjustmentPoint = adjustmentPoint;
	if (newNodeData.transformation) {
		newNodeData.transformation.translateX = nearbyItemMbr.getCenter().x;
		newNodeData.transformation.translateY = nearbyItemMbr.getCenter().y;
	}

	while (
		board.index.getNearestTo(
			new Point(nearbyItemMbr.right, nearbyItemMbr.top),
			20,
			(otherItem: Item) =>
				otherItem.itemType !== "Connector",
			DEFAULT_MAX_NODE_WIDTH,
		).length > 0
	) {
		nearbyItemMbr.transform(
			new Matrix(iterAdjustment.x * step, iterAdjustment.y * step),
		);
		if (newNodeData.transformation) {
			newNodeData.transformation.translateX = nearbyItemMbr.right;
			newNodeData.transformation.translateY = nearbyItemMbr.top;
		}
		step += 1;
	}

	const newItems = board.createItem(
		board.getNewItemId(),
		newNodeData,
	) as AINode;

	const defaultConnector = new Connector(board);
	const connectorData = defaultConnector.serialize();
	connectorData.lineStyle = "orthogonal";

	const savedStart = connectorStorage.getConnectorPointer("start");
	if (savedStart) {
		connectorData.startPointerStyle = savedStart;
	}
	const savedEnd = connectorStorage.getConnectorPointer("end");
	if (savedEnd) {
		connectorData.endPointerStyle = savedEnd;
	}
	connectorData.text = new RichText(new Mbr()).serialize();

	return {
		newItem: newItems,
		connectorData,
	};
}

export function createNode(
	board: Board,
	inputValue: string,
	isUserRequest: boolean,
	parentItem?: PossibleParentNode,
	withPlaceholder = false,
	isImage = false,
): { node: AINode | ImageItem; connectorData: ConnectorData | null } {
	let parentNodeId: string | undefined;
	if (parentItem && parentItem.itemType === "AINode") {
		parentNodeId = parentItem.getId();
	}
	let node;
	if (isImage) {
		node = new ImageItem(
			{
				base64: undefined,
				imageDimension: { width: 600, height: 600 },
				storageLink: "",
			},
			board,
			board.events,
		);
		board.AIImagePlaceholder = node;
	} else {
		node = new AINode(isUserRequest, parentNodeId);
		const nodeRichText = node.getRichText();
		nodeRichText.setMaxWidth(600);
		nodeRichText.setSelectionHorisontalAlignment("left");
		nodeRichText.container.right = nodeRichText.container.left + 600;
		if (withPlaceholder) {
			nodeRichText.editor.insertCopiedText(
				t("AIInput.generatingResponse") + PLACEHOLDER_OFFSET,
			);
		} else {
			nodeRichText.editor.insertCopiedText(inputValue);
		}
	}
	// const node = new AINode(isUserRequest, parentNodeId);

	if (!parentItem) {
		const { newItem, connectorData } = calculateParentItemPosition(
			node,
			board,
		);

		return { node: newItem, connectorData };
	}

	const { newItem, connectorData } = calculateNodePosition(
		node,
		parentItem,
		!isUserRequest,
		board,
	);
	return { node: newItem, connectorData };
}
