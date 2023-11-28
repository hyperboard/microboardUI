import * as React from "react";
import { Icon } from "../Icon";
import { ConnectorLineStyle } from "../../Board/Items/Connector";
import { Button } from "View/ContextPanel/Button";

interface Props {
	onPick: (type: ConnectorLineStyle) => void;
}

interface LineStyleButtonProps {
	lineStyle: ConnectorLineStyle;
	onPick: () => void;
}

export function ConnectorLineStyleButton(
	props: LineStyleButtonProps,
): React.ReactElement {
	const buttonStyle: React.CSSProperties = {
		width: "24px",
		height: "24px",
		margin: "8px",
		padding: "0px",
		border: "none",
		cursor: "pointer",
		backgroundColor: "white",
	};
	const iconStyle: React.CSSProperties = {
		display: "block",
		overflow: "hidden",
	};
	return (
		<button
			id={`Pick${props.lineStyle}`}
			title={props.lineStyle}
			onMouseEnter={event => {
				event.currentTarget.style.color = "blue";
			}}
			onMouseLeave={event => {
				event.currentTarget.style.color = "black";
			}}
			onClick={props.onPick}
			style={buttonStyle}
		>
			<Icon
				name={props.lineStyle}
				width={24}
				height={24}
				style={iconStyle}
			/>
		</button>
	);
}

export function ConnectorLineStylePicker(props: Props): React.ReactElement {
	return (
		<div>
			<Button
				id="PickStraight"
				onClick={() => {
					props.onPick("straight");
				}}
				title="Straight"
			>
				<Icon name="straight" width={24} height={24} />
			</Button>
			<Button
				id="PickCurved"
				onClick={() => {
					props.onPick("curved");
				}}
				title="Curved"
			>
				<Icon name="curved" width={24} height={24} />
			</Button>
		</div>
	);
}
