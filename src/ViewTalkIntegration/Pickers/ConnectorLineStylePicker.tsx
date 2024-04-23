import React from "react";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

type Props = {
	onPick: (type: ConnectorLineStyle) => void;
	selected?: string;
};

export function ConnectorLineStylePicker({
	onPick,
	selected,
}: Props): React.ReactElement {
	const handleStraightPick = () => {
		onPick("straight");
	};
	const handleCurvedPick = () => {
		onPick("curved");
	};
	return (
		<>
			<UiButton
				onClick={handleStraightPick}
				active={selected === "straight"}
			>
				<Icon iconName="DiagonalLine" width={18} height={18} />
			</UiButton>
			<UiButton onClick={handleCurvedPick} active={selected === "curved"}>
				<Icon iconName="CurvedLine" width={18} height={18} />
			</UiButton>
		</>
	);
}
