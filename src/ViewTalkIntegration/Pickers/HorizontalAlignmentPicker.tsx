import { HorisontalAlignment } from "Board/Items/Alignment";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (alignment: HorisontalAlignment) => void;
	alignment: 'center' | 'left' | 'right';
}

export function HorisontalAlignmentPicker({alignment, onPick}: Props): React.ReactElement {
	return (
		<>
			<Button
				id="ChangeHorisontalAlignmentLeft"
				key="ChangeHorisontalAlignmentLeft"
				onClick={() => {
					onPick("left");
				}}
				margin={0}
				isOn={alignment === 'left'}
			>
				{/* <Icon name={"HorisontalAlignLeft"} width={24} height={24} /> */}
				<Icon iconName="TextAlignLeft" width={16} height={16}/>
			</Button>
			<Button
				id="ChangeHorisontalAlignmentCenter"
				key="ChangeHorisontalAlignmentCenter"
				onClick={() => {
					onPick("center");
				}}
				margin={0}
				isOn={alignment === 'center'}
			>
				{/* <Icon name={"HorisontalAlignCenter"} width={24} height={24} /> */}
				<Icon iconName="TextAlignCenter" width={16} height={16}/>
			</Button>
			<Button
				id="ChangeHorisontalAlignmentRight"
				key="ChangeHorisontalAlignmentRight"
				onClick={() => {
					onPick("right");
				}}
				margin={0}
				isOn={alignment === 'right'}
			>
				{/* <Icon name={"HorisontalAlignRight"} width={24} height={24} /> */}
				<Icon iconName="TextAlignRight" width={16} height={16}/>
			</Button>
		</>
	);
}
