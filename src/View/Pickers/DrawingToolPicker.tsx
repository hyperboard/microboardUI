import React from "react";
import { UiButton } from "../Ui/UiButton";
import { Icon } from "../Icon";
import { DRAWING_TOOLS, DrawingTool } from "Board/Settings";

type Props = {
	onPick: (type: DrawingTool) => void;
	selected?: DrawingTool | "None";
};

export const DrawingToolPicker = ({
	selected,
	onPick,
}: Props): React.ReactElement => {
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
