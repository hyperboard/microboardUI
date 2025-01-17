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
	newNode: AINode,
	selectedItem: PossibleParentNode,
	isResponseNode: boolean,
	board: Board,
): { newItem: AINode; connectorData: ConnectorData } {
	const connectorStorage = new SessionStorage();
	const currMbr = selectedItem.getMbr();
	const currData = selectedItem.serialize();
	const newNodeData = newNode.serialize();
	const width = DEFAULT_MAX_NODE_WIDTH;
	const height = 100;

	const iterAdjustment = { x: -2 * width, y: 0 };

	const baseAdjustments = {
		translateX: currMbr.getWidth() / 2,
		translateY: height,
	};
	const adjustmentPoint = new Point(
		baseAdjustments.translateX + currMbr.left,
		baseAdjustments.translateY + currMbr.top,
	);

	newNodeData.adjustmentPoint = adjustmentPoint;

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
		newItem,
		connectorData,
	};
}

export function createNode(
	board: Board,
	inputValue: string,
	isUserRequest: boolean,
	parentItem?: PossibleParentNode,
	withPlaceholder = false,
): { node: AINode; connectorData: ConnectorData | null } {
	let parentNodeId: string | undefined;
	if (parentItem && parentItem.itemType === "AINode") {
		parentNodeId = parentItem.getId();
	}

	const node = new AINode(isUserRequest, parentNodeId);
	const nodeRichText = node.getRichText();
	nodeRichText.setMaxWidth(600);
	nodeRichText.setSelectionHorisontalAlignment("left");
	nodeRichText.container.right = nodeRichText.container.left + 600;

	if (withPlaceholder) {
		nodeRichText.placeholderText = PLACEHOLDER_TEXT;
	} else {
		nodeRichText.editor.insertCopiedText(inputValue);
	}

	if (!parentItem) {
		const cameraMbr = board.camera.getMbr();

		const centerX = cameraMbr.getCenter().x;
		const centerY = cameraMbr.getCenter().y;
		node.transformation.translateTo(centerX, centerY);
		return {
			node: board.createItem(
				board.getNewItemId(),
				node.serialize(),
			) as AINode,
			connectorData: null,
		};
	}
	const { newItem, connectorData } = calculateNodePosition(
		node,
		parentItem,
		!isUserRequest,
		board,
	);
	return { node: newItem, connectorData };
}
