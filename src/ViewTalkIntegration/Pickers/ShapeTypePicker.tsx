import { ShapeType } from "Board/Items/Shape/Basic";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

const shapes = [
	"Rectangle",
	"RoundedRectangle",
	"Circle",
	"Hexagon",
	"Rhombus",
	"Triangle",
	"ReversedTriangle",
	"Parallelogram",
	"ReversedParallelogram",
	"SpeachBubble",
	"ArrowBlockLeft",
	"ArrowBlockRight",
	"ArrowLeft",
	"ArrowRight",
	"Star",
] as const;

export function ShapePicker(props: {
	onPick: (type: ShapeType) => void;
}): React.ReactElement {
	const buttons = [];
	for (const shape of shapes) {
		buttons.push(
			<Button
				width={32}
				height={32}
				id={`Pick${shape}`}
				onClick={() => {
					props.onPick(shape as ShapeType);
				}}
				margin={0}
				key={shape}
			>
				<Icon iconName={shape} width={24} height={24} />
			</Button>,
		);
	}
	return <>{buttons}</>;
}
