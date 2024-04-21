import { ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";

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

type Props = {
	onPick: (type: ShapeType) => void;
};

export function ShapePicker({ onPick }: Props): React.ReactElement {
	return (
		<>
			{shapes.map(shape => (
				<UiButton onClick={() => onPick(shape)} key={shape}>
					<Icon iconName={shape} width={20} height={20} />
				</UiButton>
			))}
		</>
	);
}
