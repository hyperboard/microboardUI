import { Button } from "View/ContextPanel";
import { PointerIcon } from "View/Icon/PointerIcon";
import * as React from "react";

const pointerTypes = [
	{ id: "None", label: "None" },
	{ id: "ArrowBroad", label: "Arrow (Broad)" },
	{ id: "ArrowThin", label: "Arrow (Thin)" },
	{ id: "TriangleFilled", label: "Triangle (Filled)" },
	{ id: "CircleFilled", label: "Circle (Filled)" },
	{ id: "Angle", label: "Angle" },
	{ id: "TriangleEmpty", label: "Triangle (Empty)" },
	{ id: "DiamondFilled", label: "Diamond (Filled)" },
	{ id: "DiamondEmpty", label: "Diamond (Empty)" },
	{ id: "Zero", label: "Zero" },
	{ id: "One", label: "One" },
	{ id: "Many", label: "Many" },
	{ id: "ManyMandatory", label: "Many (Mandatory)" },
	{ id: "OneMandatory", label: "One (Mandatory)" },
	{ id: "ManyOptional", label: "Many (Optional)" },
	{ id: "OneOptional", label: "One (Optional)" },
];

type Props = {
	onPick: (pointer: string) => void;
};

export function ConnectorStartPointerPicker({
	onPick,
}: Props): React.ReactElement {
	const buttons = [];
	for (const type of pointerTypes) {
		buttons.push(
			<Button
				id={type.id}
				key={type.id}
				onClick={() => {
					onPick(type.id);
				}}
				title={type.label}
			>
				<PointerIcon type={type.id} width={24} height={24} />
			</Button>,
		);
	}
	return <div>{buttons}</div>;
}

export function ConnectorEndPointerPicker({
	onPick,
}: {
	onPick: (pointer: string) => void;
}): React.ReactElement {
	const buttons = [];
	for (const pointerType of pointerTypes) {
		buttons.push(
			<Button
				id={pointerType.id}
				key={pointerType.id}
				onClick={() => {
					onPick(pointerType.id);
				}}
				title={pointerType.label}
			>
				<PointerIcon type={pointerType.id} width={24} height={24} />
			</Button>,
		);
	}
	return <div>{buttons}</div>;
}
