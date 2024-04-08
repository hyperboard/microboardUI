import { VerticalAlignment } from "Board/Items/Alignment";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (alignment: VerticalAlignment) => void;
	alignment?: "top" | "bottom" | "center";
}

export function VerticalAlignmentPicker(props: Props): React.ReactElement {
	return (
		<>
			<Button
				id="ChangeVerticalAlignmentTop"
				key="ChangeVerticalAlignmentTop"
				onClick={() => {
					props.onPick("top");
				}}
				isOn={props.alignment === 'top'}
				margin={0}
			>
				<Icon iconName={"VerticalAlignTop"} width={16} height={16} />
			</Button>
			<Button
				id="ChangeVerticalAlignmentCenter"
				key="ChangeVerticalAlignmentCenter"
				onClick={() => {
					props.onPick("center");
				}}
				isOn={props.alignment === 'center'}
				margin={0}

			>
				<Icon iconName={"VerticalAlignCenter"} width={16} height={16} />
			</Button>
			<Button
				id="ChangeVerticalAlignmentBottom"
				key="ChangeVerticalAlignmentBottom"
				onClick={() => {
					props.onPick("bottom");
				}}
				isOn={props.alignment === 'bottom'}
				margin={0}
			>
				<Icon iconName={"VerticalAlignBottom"} width={16} height={16} />
			</Button>
		</>
	);
}
