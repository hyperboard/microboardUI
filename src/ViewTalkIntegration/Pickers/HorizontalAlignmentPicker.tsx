import { HorisontalAlignment } from "Board/Items/Alignment";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (alignment: HorisontalAlignment) => void;
	alignment: 'center' | 'left' | 'right';
}

export function HorisontalAlignmentPicker({
	alignment,
	onPick,
}: Props): React.ReactElement {
	const handlePick = (alignment: HorisontalAlignment) => () => {
		onPick(alignment);
	};
	return (
		<>
			<Button
				id="ChangeHorisontalAlignmentLeft"
				key="ChangeHorisontalAlignmentLeft"
				onClick={handlePick("left")}
				margin={0}
				isOn={alignment === 'left'}
			>
				<Icon iconName="TextAlignLeft" width={16} height={16} />
			</Button>
			<Button
				id="ChangeHorisontalAlignmentCenter"
				key="ChangeHorisontalAlignmentCenter"
				onClick={handlePick("center")}
				margin={0}
				isOn={alignment === 'center'}
			>
				<Icon iconName="TextAlignCenter" width={16} height={16} />
			</Button>
			<Button
				id="ChangeHorisontalAlignmentRight"
				key="ChangeHorisontalAlignmentRight"
				onClick={handlePick("right")}
				margin={0}
				isOn={alignment === 'right'}
			>
				<Icon iconName="TextAlignRight" width={16} height={16} />
			</Button>
		</>
	);
}
