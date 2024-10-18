import React from "react";
import { DrawingType } from "../../Board/Items/Drawing";
import { UiButton } from "../Ui/UiButton";
import { Icon, ShapeIcon } from "../Icon";
import { DRAWING_TOOLS } from "../Tools/AddDrawing";

type Props = {
	onPick: (type: DrawingType) => void;
	selected?: DrawingType | "None";
};

export const DrawingToolPicker = ({ selected, onPick }: Props) => {
	return (
		<>
			{DRAWING_TOOLS.map(drawing => (
				<UiButton
					id={`drawing-${drawing}`}
					onClick={() => onPick(drawing)}
					key={drawing}
					size="md"
					variant="secondary"
					active={selected === drawing}
				>
					<Icon iconName={drawing} width={24} height={24} />
				</UiButton>
			))}
		</>
	);
};
