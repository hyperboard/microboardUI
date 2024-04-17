import { ShapeType } from "Board/Items/Shape/Basic";
import * as React from "react";
import { Icon } from "../Icon";
import { Button } from "View/ContextPanel";

const shapes = [
	{ id: "Rectangle", label: "Rectangle" },
	{ id: "RoundedRectangle", label: "Rounded Rectangle" },
	{ id: "Circle", label: "Circle" },
	{ id: "Triangle", label: "Triangle" },
	{ id: "Rhombus", label: "Rhombus" },
	{ id: "Parallelogram", label: "Parallelogram" },
	{ id: "Hexagon", label: "Hexagon" },
	{ id: "Octagon", label: "Octagon" },
	{ id: "Pentagon", label: "Pentagon" },
	{ id: "Cross", label: "Cross" },
	{ id: "Star", label: "Star" },
	{ id: "Cloud", label: "Cloud" },
	{ id: "Cylinder", label: "Cylinder" },
	{ id: "Trapezoid", label: "Trapezoid" },
	{ id: "PredefinedProcess", label: "Predefined Process" },
	{ id: "ArrowLeft", label: "Arrow Left" },
	{ id: "ArrowLeftRight", label: "Arrow Left And Right" },
	{ id: "ArrowRight", label: "Arrow Right" },
	{ id: "SpeachBubble", label: "Speach Bubble" },
	{ id: "BracesRight", label: "Braces Right" },
	{ id: "BracesLeft", label: "Braces Left" },
] as const;

type Props = {
	onPick: (type: ShapeType) => void;
};

export function ShapePicker(props: Props): React.ReactElement {
	const buttons = [];
	for (const shape of shapes) {
		buttons.push(
			<Button
				id={`Pick${shape.id}`}
				title={shape.label}
				onClick={() => {
					props.onPick(shape.id);
				}}
				margin={0}
				key={shape.id}
			>
				<Icon name={shape.id} width={24} height={24} />
			</Button>,
		);
	}
	return <>{buttons}</>;
}
