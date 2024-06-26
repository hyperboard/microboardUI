import { HorisontalAlignment } from "Board/Items/Alignment";
import React from "react";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";

type Props = {
	onPick: (alignment: HorisontalAlignment) => void;
	alignment: "center" | "left" | "right";
};

export function HorizontalAlignmentPicker({
	alignment,
	onPick,
}: Props): React.ReactElement {
	const handlePick = (alignment: HorisontalAlignment) => () => {
		onPick(alignment);
	};
	return (
		<>
			<UiButton
				id={"horizontal-alignment-left"}
				onClick={handlePick("left")}
				active={alignment === "left"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName="TextAlignLeft" width={24} height={24} />
			</UiButton>
			<UiButton
				id={"horizontal-alignment-center"}
				onClick={handlePick("center")}
				active={alignment === "center"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName="TextAlignCenter" width={24} height={24} />
			</UiButton>
			<UiButton
				id={"horizontal-alignment-right"}
				onClick={handlePick("right")}
				active={alignment === "right"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName="TextAlignRight" width={24} height={24} />
			</UiButton>
		</>
	);
}
