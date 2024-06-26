import { VerticalAlignment } from "Board/Items/Alignment";
import React from "react";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";

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
			<UiButton
				id="vertical-alignment-top"
				onClick={handlePick("top")}
				active={alignment === "top"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName={"VerticalAlignTop"} width={24} height={24} />
			</UiButton>
			<UiButton
				id="vertical-alignment-center"
				onClick={handlePick("center")}
				active={alignment === "center"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName={"VerticalAlignCenter"} width={24} height={24} />
			</UiButton>
			<UiButton
				id="vertical-alignment-bottom"
				onClick={handlePick("bottom")}
				active={alignment === "bottom"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName={"VerticalAlignBottom"} width={24} height={24} />
			</UiButton>
		</>
	);
}
