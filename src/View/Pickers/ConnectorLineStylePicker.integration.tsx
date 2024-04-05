import * as React from "react";
import { ConnectorLineStyle } from "../../Board/Items/Connector";
import { Button } from "View/ContextPanel";
import { IconIntegration } from "View/Icon/Integration";

interface Props {
	onPick: (type: ConnectorLineStyle) => void;
  selected?: string;
}

// interface LineStyleButtonProps {
// 	lineStyle: ConnectorLineStyle;
// 	onPick: () => void;
// }

// export function ConnectorLineStyleButton(
// 	props: LineStyleButtonProps,
// ): React.ReactElement {
// 	const buttonStyle: React.CSSProperties = {
// 		width: "24px",
// 		height: "24px",
// 		margin: "8px",
// 		padding: "0px",
// 		border: "none",
// 		cursor: "pointer",
// 		backgroundColor: "white",
// 	};
// 	const iconStyle: React.CSSProperties = {
// 		display: "block",
// 		overflow: "hidden",
// 	};
// 	return (
// 		<button
// 			id={`Pick${props.lineStyle}`}
// 			title={props.lineStyle}
// 			onMouseEnter={event => {
// 				event.currentTarget.style.color = "blue";
// 			}}
// 			onMouseLeave={event => {
// 				event.currentTarget.style.color = "black";
// 			}}
// 			onClick={props.onPick}
// 			style={buttonStyle}
// 		>
// 			<IconIntegration
// 				width={24}
// 				height={24}
// 				style={iconStyle}
// 			/>
// 		</button>
// 	);
// }

export function ConnectorLineStylePicker(props: Props): React.ReactElement {
	return (
		<>
			<Button
				id="PickStraight"
				onClick={() => {
					props.onPick("straight");
				}}
        margin={0}
        isOn={props.selected === 'straight'}
			>
				<IconIntegration iconName="DiagonalLine" width={24} height={24} />
			</Button>
			<Button
				id="PickCurved"
				onClick={() => {
					props.onPick("curved");
				}}
        margin={0}
        isOn={props.selected === 'curved'}
			>
				{/* <Icon name="curved" width={24} height={24} /> */}
				<IconIntegration iconName="CurvedLine" width={24} height={24} />
			</Button>
		</>
	);
}
