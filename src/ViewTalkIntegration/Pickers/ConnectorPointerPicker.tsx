import { Button } from "../ContextPanel";
import * as React from "react";
import { Icon } from "../Icon";
import { IconId } from "../Icon/Icon";

const pointerTypes = [
	{ id: "None", icon: "PointerStart" },
	{ id: "ArrowBroad", icon: "PointerEnd" },
	// { id: "ArrowThin", label: "Arrow (Thin)" },
	{ id: "TriangleFilled", icon: "PointerEndCompact" },
	// { id: "CircleFilled", label: "Circle (Filled)" },
	// { id: "Angle", label: "Angle" },
	// { id: "TriangleEmpty", label: "Triangle (Empty)" },
	// { id: "DiamondFilled", label: "Diamond (Filled)" },
	// { id: "DiamondEmpty", label: "Diamond (Empty)" },
	// { id: "Zero", label: "Zero" },
	// { id: "One", label: "One" },
	// { id: "Many", label: "Many" },
	// { id: "ManyMandatory", label: "Many (Mandatory)" },
	// { id: "OneMandatory", label: "One (Mandatory)" },
	// { id: "ManyOptional", label: "Many (Optional)" },
	// { id: "OneOptional", label: "One (Optional)" },
];

export function ConnectorStartPointerPicker({
	onPick,
	selected,
}: {
	onPick: (pointer: string) => void;
	selected: string;
}): React.ReactElement {
	const buttons = [];
	for (const type of pointerTypes) {
		buttons.push(
			<Button
				id={type.id}
				key={type.id}
				onClick={() => {
					onPick(type.id);
				}}
				margin={0}
				isOn={selected === type.id}
			>
				<Icon iconName={type.icon as IconId} />
			</Button>,
		);
	}
	return <>{buttons}</>;
}

export function ConnectorEndPointerPicker({
	onPick,
	selected,
}: {
	onPick: (pointer: string) => void;
	selected: string;
}): React.ReactElement {
	const buttons = [];
	for (const type of pointerTypes) {
		buttons.push(
			<Button
				id={type.id}
				key={type.id}
				onClick={() => {
					onPick(type.id);
				}}
				margin={0}
				isOn={selected === type.id}
			>
				<Icon iconName={type.icon as IconId} />
			</Button>,
		);
	}
	return <>{buttons}</>;
}
