import { BorderStyle } from "Board/Items/Path";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

type Props = {
	onPick: (style: BorderStyle) => void;
	stroke?: string;
};

export function StrokeStylePicker({
	stroke,
	onPick,
}: Props): React.ReactElement {
	const handleSolidPick = () => {
		onPick("solid");
	};

	const handleDashPick = () => {
		onPick("dash");
	};

	const handleDotPick = () => {
		onPick("dot");
	};

	return (
		<>
			<UiButton onClick={handleSolidPick} active={stroke === "solid"}>
				<Icon width={16} height={16} iconName="DiagonalLine" />
			</UiButton>
			<UiButton onClick={handleDashPick} active={stroke === "dash"}>
				<Icon width={16} height={16} iconName="DiagonalDashedLine" />
			</UiButton>
			<UiButton onClick={handleDotPick} active={stroke === "dot"}>
				<Icon width={16} height={16} iconName="DiagonalDottedLine" />
			</UiButton>
		</>
	);
}
