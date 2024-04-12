import { BorderStyle } from "Board/Items/Path";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (style: BorderStyle) => void;
	stroke?: string;
}

export function StrokeStylePicker(props: Props): React.ReactElement {
	const handleSolidPick = () => {
		props.onPick("solid");
	};

	const handleDashPick = () => {
		props.onPick("dash");
	};

	const handleDotPick = () => {
		props.onPick("dot");
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: '0 4px',
			}}
		>
			<Button
				id="ChangeBorderStyleSolid"
				key="ChangeBorderStyleSolid"
				onClick={handleSolidPick}
				margin={0}
				isOn={props.stroke === "solid"}
			>
				<Icon iconName="DiagonalLine" />
			</Button>
			<Button
				id="ChangeBorderStyleDashed"
				key="ChangeBorderStyleDashed"
				onClick={handleDashPick}
				margin={0}
				isOn={props.stroke === "dash"}
			>
				<Icon iconName="DiagonalDashedLine" />
			</Button>
			<Button
				id="ChangeBorderStyleDotted"
				key="ChangeBorderStyleDotted"
				onClick={handleDotPick}
				margin={0}
				isOn={props.stroke === "dot"}
			>
				<Icon iconName="DiagonalDottedLine" />
			</Button>
		</div>
	);
}
