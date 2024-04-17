import { Button } from "../ContextPanel";
import * as React from "react";
import { Icon } from "../Icon";
import { IconId } from "../Icon/Icon";

const pointerTypes = [
	{ id: "None", icon: "PointerStart" },
	{ id: "ArrowBroad", icon: "PointerEnd" },
	{ id: "TriangleFilled", icon: "PointerEndCompact" },
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
