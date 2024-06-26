import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorIcon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import React from "react";

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
				id={"connector-straight"}
				onClick={handleStraightPick}
				active={selected === "straight"}
				variant="secondary"
			>
				<ConnectorIcon iconName="straight" />
			</UiButton>
			<UiButton
				id={"connector-curved"}
				onClick={handleCurvedPick}
				active={selected === "curved"}
				variant="secondary"
			>
				<ConnectorIcon iconName="curved" />
			</UiButton>
		</>
	);
}
