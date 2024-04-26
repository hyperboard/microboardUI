import { VerticalAlignment } from "Board/Items/Alignment";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

type Props = {
	onPick: (alignment: VerticalAlignment) => void;
	alignment?: "top" | "bottom" | "center";
};

export function VerticalAlignmentPicker({
	onPick,
	alignment,
}: Props): React.ReactElement {
	const handlePick = (alignment: VerticalAlignment) => () =>
		onPick(alignment);
	return (
		<>
			<UiButton onClick={handlePick("top")} active={alignment === "top"}>
				<Icon iconName={"VerticalAlignTop"} width={16} height={16} />
			</UiButton>
			<UiButton
				onClick={handlePick("center")}
				active={alignment === "center"}
			>
				<Icon iconName={"VerticalAlignCenter"} width={16} height={16} />
			</UiButton>
			<UiButton
				onClick={handlePick("bottom")}
				active={alignment === "bottom"}
			>
				<Icon iconName={"VerticalAlignBottom"} width={16} height={16} />
			</UiButton>
		</>
	);
}
