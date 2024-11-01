import React, { CSSProperties, MouseEvent } from "react";
import { BoardEvent } from "Board/Events/Events";
import { Operation } from "Board/Events";
import { MethodType } from "Board/Events/EventsOperations";
import { Item, Mbr } from "Board/Items";
import { useAppContext } from "View/AppContext";

type EventTypeMap = {
	[K in MethodType]: string;
};

interface Props {
	event: BoardEvent;
	style: CSSProperties;
}

const PrettifiedEvent: React.FC<Props> = ({ event, style }) => {
	const { board } = useAppContext();
	const { operation, prependix } = getOperation(
		event.body.operation,
		board.events?.getAll(),
	);
	const userId = event.body.userId;
	const operationBase = operation.method
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/^./, str => str.toUpperCase());
	const appendix = getOperationAppendix(operation);
	const mappedId = getId(userId);

	const itemIds = (() => {
		if (
			!("item" in operation) &&
			!("items" in operation) &&
			!("itemsMap" in operation) &&
			!("itemsOps" in operation)
		) {
			return undefined;
		}
		const items =
			"item" in operation
				? operation.item
				: "items" in operation
					? operation.items
					: "itemsMap" in operation
						? operation.itemsMap
						: "itemsOps" in operation
							? operation.itemsOps.map(op => op.item)
							: undefined;

		if (typeof items === "string") {
			return [items];
		}
		if (Array.isArray(items)) {
			return items;
		}
		if (typeof items === "object") {
			return Object.keys(items);
		}
		return undefined;
	})();

	const items = itemIds
		?.map(id => board.items.getById(id))
		.filter(item => !!item);

	const sameTypes = items?.every(
		(item, idx, arr) => idx === 0 || item.itemType === arr[0].itemType,
	);

	const handleClick = (items: Item[]) => (_event: MouseEvent) => {
		const itemsMbr = items[0]
			.getMbr()
			.combine(items.slice(1).map(item => item.getMbr()));
		board.camera.zoomToFit(itemsMbr);
	};

	return (
		<span style={style}>
			{prependix && <span>{prependix}</span>}
			{`${operationBase}`}
			{appendix && (
				<>
					{" ("}
					<span>{appendix}</span>
					{") "}
				</>
			)}
			{items && (
				<>
					{" "}
					{items.length === 0 ? (
						"(Deleted)"
					) : (
						<span
							style={{
								color: "blue",
								textDecoration: "underline",
								background: "none",
								border: "none",
								cursor: "pointer",
							}}
							onClick={handleClick(items)}
						>
							{`(${
								items.length > 1
									? sameTypes
										? `${items[0].itemType}s`
										: "Group"
									: items[0].itemType
							})`}
						</span>
					)}{" "}
				</>
			)}
			{` - User ${mappedId}`}
		</span>
	);
};

export default PrettifiedEvent;

let currentId = 1;
const idMap = new Map<number, number>();

function getId(userId: number): number {
	let mappedId = idMap.get(userId);
	if (!mappedId) {
		mappedId = currentId++;
		idMap.set(userId, mappedId);
	}
	return mappedId;
}

function getOperation(
	op: Operation,
	events?: BoardEvent[],
): {
	operation: Operation;
	prependix: string;
} {
	const defaultReturn = {
		operation: op,
		prependix: "",
	};

	if (!events) {
		return defaultReturn;
	}

	if (op.method === "undo") {
		const toUndo = events.find(event => event.body.eventId === op.eventId);
		if (!toUndo) {
			return defaultReturn;
		}

		return {
			operation: toUndo.body.operation,
			prependix: "Undo - ",
		};
	}

	if (op.method === "redo") {
		const undoEvent = events.find(
			event => event.body.eventId === op.eventId,
		);
		if (!undoEvent || undoEvent.body.operation.method !== "undo") {
			return defaultReturn;
		}

		const undidId = undoEvent.body.operation.eventId;
		const toRedo = events.find(event => event.body.eventId === undidId);
		if (!toRedo) {
			return defaultReturn;
		}

		return {
			operation: toRedo.body.operation,
			prependix: "Redo - ",
		};
	}

	return defaultReturn;
}

function getOperationAppendix(operation: Operation): string {
	const appendix: string[] = [];

	if ("x" in operation && "y" in operation) {
		appendix.push(
			`x:${Math.round(operation.x)}; y:${Math.round(operation.y)}`,
		);
	}

	if ("scale" in operation) {
		const { x, y } = operation.scale;
		if (x !== 1 && y !== 1) {
			appendix.push(`scale - x:${Math.round(x)}; y:${Math.round(y)}`);
		}
	}

	if ("translate" in operation) {
		const { x, y } = operation.translate;
		if (x !== 0 && y !== 0) {
			appendix.push(`translate - x:${Math.round(x)}; y:${Math.round(y)}`);
		}
	}

	if (operation.method === "transformMany") {
		const appendixes = Object.values(operation.items).map(op =>
			getOperationAppendix(op),
		);
		if (appendixes.every(app => app === appendixes[0])) {
			appendix.push(appendixes[0]);
		}
	}

	return appendix.join(", ");
}
