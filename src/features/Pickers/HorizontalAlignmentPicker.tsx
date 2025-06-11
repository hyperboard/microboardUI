import { HorisontalAlignment } from "microboard-temp";
import React from "react";
import { UiButton } from "shared/ui-lib/UiButton";
import { Icon } from "shared/ui-lib/Icon";

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
				id={"ChangeHorisontalAlignmentLeft"}
				onClick={handlePick("left")}
				active={alignment === "left"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName="TextAlignLeft" width={24} height={24} />
			</UiButton>
			<UiButton
				id={"ChangeHorisontalAlignmentCenter"}
				onClick={handlePick("center")}
				active={alignment === "center"}
				variant="secondary"
				size="sm"
			>
				<Icon iconName="TextAlignCenter" width={24} height={24} />
			</UiButton>
			<UiButton
				id={"ChangeHorisontalAlignmentRight"}
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
