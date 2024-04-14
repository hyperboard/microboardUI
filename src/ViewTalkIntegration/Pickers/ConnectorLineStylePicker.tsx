import * as React from "react";
import { ConnectorLineStyle } from "../../Board/Items/Connector";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (type: ConnectorLineStyle) => void;
	selected?: string;
}

export function ConnectorLineStylePicker(props: Props): React.ReactElement {
	const handleStraightPick = () => {
		props.onPick("straight");
	};
	const handleCurvedPick = () => {
		props.onPick("curved");
	};
	return (
		<>
			<Button
				id="PickStraight"
				onClick={handleStraightPick}
				margin={0}
				isOn={props.selected === "straight"}
			>
				<Icon iconName="DiagonalLine" width={24} height={24} />
			</Button>
			<Button
				id="PickCurved"
				onClick={handleCurvedPick}
				margin={0}
				isOn={props.selected === "curved"}
			>
				<Icon iconName="CurvedLine" width={24} height={24} />
			</Button>
		</>
	);
}
