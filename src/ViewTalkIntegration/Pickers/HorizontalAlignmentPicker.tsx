import { HorisontalAlignment } from "Board/Items/Alignment";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

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
				onClick={handlePick("left")}
				active={alignment === "left"}
			>
				<Icon iconName="TextAlignLeft" width={16} height={16} />
			</UiButton>
			<UiButton
				onClick={handlePick("center")}
				active={alignment === "center"}
			>
				<Icon iconName="TextAlignCenter" width={16} height={16} />
			</UiButton>
			<UiButton
				onClick={handlePick("right")}
				active={alignment === "right"}
			>
				<Icon iconName="TextAlignRight" width={16} height={16} />
			</UiButton>
		</>
	);
}
