import { ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { ShapeIcon } from "ViewUpdate/Icon";
import { SHAPE_TYPES } from "ViewUpdate/Tools/AddShape";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";

type Props = {
	onPick: (type: ShapeType) => void;
	selected?: ShapeType | "None";
};

export function ShapePicker({ onPick, selected }: Props): React.ReactElement {
	return (
		<>
			{SHAPE_TYPES.map(shape => (
				<UiButton
					id={`shape-${shape}`}
					onClick={() => onPick(shape)}
					key={shape}
					size="md"
					variant="secondary"
					active={selected === shape}
				>
					<ShapeIcon iconName={shape} width={24} height={24} />
				</UiButton>
			))}
		</>
	);
}
