import { ShapeType } from "Board/Items/Shape/Basic";
import * as React from "react";
import { Button } from "View/ContextPanel";
import { IconId } from "View/Icon/Integration/Icon";
import { IconIntegration } from "View/Icon/Integration";

// const shapes: {id: IconId, label: string}[] = [
// 	{ id: "Rectangle", label: "Rectangle" },
// 	{ id: "RoundedRectangle", label: "Rounded Rectangle" },
// 	{ id: "Circle", label: "Circle" },
// 	{ id: "Hexagon", label: "Hexagon" },
// 	{ id: "Rhombus", label: "Rhombus" },
// 	{ id: "Triangle", label: "Triangle" },
// 	{ id: "ReversedTriangle", label: "ReversedTriangle"},
// 	{ id: "Parallelogram", label: "Parallelogram" },
// 	{ id: "ReversedParallelogram", label: "Parallelogram" },
// 	{ id: "SpeachBubble", label: "Speach Bubble" },
// 	{ id: "ArrowBlockLeft", label: "Arrow Left" },
// 	{ id: "ArrowBlockRight", label: "Arrow Right" },
// 	{ id: "ArrowLeft", label: "Arrow Left" },
// 	{ id: "ArrowRight", label: "Arrow Right" },
// 	{ id: "Star", label: "Star" },

// { id: "Cross", label: "Cross" },
// { id: "Cloud", label: "Cloud" },
// { id: "Cylinder", label: "Cylinder" },
// { id: "Trapezoid", label: "Trapezoid" },
// { id: "PredefinedProcess", label: "Predefined Process" },
// { id: "ArrowLeftRight", label: "Arrow Left And Right" },
// { id: "BracesRight", label: "Braces Right" },
// { id: "BracesLeft", label: "Braces Left" },
// ];

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
					props.onPick(shape);
				}}
				margin={0}
				key={shape}
			>
				<IconIntegration iconName={shape} width={24} height={24} />
			</Button>,
		);
	}
	return <>{buttons}</>;
}
