import { BorderStyle } from "Board/Items/Path";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (style: BorderStyle) => void;
	stroke?: string;
}

export function StrokeStylePicker(props: Props): React.ReactElement {
	console.log(props.stroke)
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
				onClick={() => {
					props.onPick("solid");
				}}
        margin={0}
				isOn={props.stroke === 'solid'}
			>
				{/* <Icon name={"LineSolid"} width={24} height={24} /> */}
        <Icon iconName="DiagonalLine"/>
			</Button>
			<Button
				id="ChangeBorderStyleDashed"
				key="ChangeBorderStyleDashed"
				onClick={() => {
					props.onPick("dash");
				}}
        margin={0}
				isOn={props.stroke === 'dash'}
			>
				{/* <Icon name={"LineDashed"} width={24} height={24} /> */}
        <Icon iconName="DiagonalDashedLine"/>
			</Button>
			<Button
				id="ChangeBorderStyleDotted"
				key="ChangeBorderStyleDotted"
				onClick={() => {
					props.onPick("dot");
				}}
        margin={0}
				isOn={props.stroke === 'dot'}
			>
				{/* <Icon name={"LineDotted"} width={24} height={24} /> */}
        <Icon iconName="DiagonalDottedLine"/>
			</Button>
		</div>
	);
}
