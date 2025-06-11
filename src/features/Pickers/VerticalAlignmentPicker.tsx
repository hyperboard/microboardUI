import { VerticalAlignment } from "microboard-temp";
import React from "react";
import { UiButton } from "shared/ui-lib/UiButton";
import { Icon } from "shared/ui-lib/Icon";

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
				id="ChangeVerticalAlignmentTop"
				onClick={handlePick("top")}
				active={alignment === "top"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName={"VerticalAlignTop"} width={24} height={24} />
			</UiButton>
			<UiButton
				id="ChangeVerticalAlignmentCenter"
				onClick={handlePick("center")}
				active={alignment === "center"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName={"VerticalAlignCenter"} width={24} height={24} />
			</UiButton>
			<UiButton
				id="ChangeVerticalAlignmentBottom"
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
