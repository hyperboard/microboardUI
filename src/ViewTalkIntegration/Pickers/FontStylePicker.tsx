import { TextStyle } from "Board/Items/RichText";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (style: TextStyle) => void;
}

export function FontStylePicker(props: Props): React.ReactElement {
	return (
		<>
			<Button
				id="ChangeFontBold"
				key="ChangeFontBold"
				onClick={() => {
					props.onPick("bold");
				}}
				margin={0}
			>
				{/* <BoldIcon isOn={true} width={24} height={24} /> */}
        <Icon iconName="TextBold"/>
			</Button>
			<Button
				id="ChangeFontItalics"
				key="ChangeFontItalics"
				onClick={() => {
					props.onPick("italic");
				}}
				margin={0}
			>
				{/* <ItalicsIcon width={24} height={24} /> */}
        <Icon iconName="TextItalic"/>
			</Button>
			<Button
				id="ChangeFontStrikethrough"
				key="ChangeFontStrikethrough"
				onClick={() => {
					props.onPick("line-through");
				}}
				margin={0}
			>
				{/* <StrikethroughIcon width={24} height={24} /> */}
        <Icon iconName="TextStrike"/>
			</Button>
			<Button
				id="ChangeFontUnderline"
				key="ChangeFontUnderline"
				onClick={() => {
					props.onPick("underline");
				}}
				margin={0}
			>
				{/* <UnderlineIcon width={24} height={24} /> */}
        <Icon width={26} iconName="TextUnderline"/>
			</Button>
		</>
	);
}
