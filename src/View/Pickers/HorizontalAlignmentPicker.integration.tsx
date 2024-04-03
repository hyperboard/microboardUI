import { HorisontalAlignment } from "Board/Items/Alignment";
import * as React from "react";
import { Icon } from "../Icon";
import { Button } from "View/ContextPanel";
import { IconIntegration } from "View/Icon/Integration";

interface Props {
	onPick: (alignment: HorisontalAlignment) => void;
}

export function HorisontalAlignmentPicker(props: Props): React.ReactElement {
	return (
		<>
			<Button
				id="ChangeHorisontalAlignmentLeft"
				key="ChangeHorisontalAlignmentLeft"
				onClick={() => {
					props.onPick("left");
				}}
				margin={0}
			>
				{/* <Icon name={"HorisontalAlignLeft"} width={24} height={24} /> */}
				<IconIntegration iconName="TextAlignLeft"/>
			</Button>
			<Button
				id="ChangeHorisontalAlignmentCenter"
				key="ChangeHorisontalAlignmentCenter"
				onClick={() => {
					props.onPick("center");
				}}
				margin={0}
			>
				{/* <Icon name={"HorisontalAlignCenter"} width={24} height={24} /> */}
				<IconIntegration iconName="TextAlignCenter"/>
			</Button>
			<Button
				id="ChangeHorisontalAlignmentRight"
				key="ChangeHorisontalAlignmentRight"
				onClick={() => {
					props.onPick("right");
				}}
				margin={0}
			>
				{/* <Icon name={"HorisontalAlignRight"} width={24} height={24} /> */}
				<IconIntegration iconName="TextAlignRight"/>
			</Button>
		</>
	);
}
