import { BorderStyle } from "Board/Items/Path";
import * as React from "react";
import { Icon } from "../Icon";
import { Button } from "View/ContextPanel/Button";

interface Props {
	onPick: (style: BorderStyle) => void;
}

export function StrokeStylePicker(props: Props): React.ReactElement {
	return (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "center",
				alignItems: "center",
				width: "100%",
			}}
		>
			<Button
				id="ChangeBorderStyleSolid"
				key="ChangeBorderStyleSolid"
				onClick={() => {
					props.onPick("solid");
				}}
				title="Solid"
			>
				<Icon name={"LineSolid"} width={24} height={24} />
			</Button>
			<Button
				id="ChangeBorderStyleDashed"
				key="ChangeBorderStyleDashed"
				onClick={() => {
					props.onPick("dash");
				}}
				title="Dashed"
			>
				<Icon name={"LineDashed"} width={24} height={24} />
			</Button>
			<Button
				id="ChangeBorderStyleDotted"
				key="ChangeBorderStyleDotted"
				onClick={() => {
					props.onPick("dot");
				}}
				title="Dotted"
			>
				<Icon name={"LineDotted"} width={24} height={24} />
			</Button>
		</div>
	);
}
