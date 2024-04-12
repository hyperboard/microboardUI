import { TextStyle } from "Board/Items/RichText";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (style: TextStyle) => void;
}

export function FontStylePicker(props: Props): React.ReactElement {
	const handleBoldPick = () => {
		props.onPick("bold");
	};
	const handleItalicsPick = () => {
		props.onPick("italic");
	};
	const handleLineThroughPick = () => {
		props.onPick("line-through");
	};
	const handleUnderlinePick = () => {
		props.onPick("underline");
	};
	return (
		<>
			<Button
				id="ChangeFontBold"
				key="ChangeFontBold"
				onClick={handleBoldPick}
				margin={0}
			>
				<Icon iconName="TextBold" />
			</Button>
			<Button
				id="ChangeFontItalics"
				key="ChangeFontItalics"
				onClick={handleItalicsPick}
				margin={0}
			>
				<Icon iconName="TextItalic" />
			</Button>
			<Button
				id="ChangeFontStrikethrough"
				key="ChangeFontStrikethrough"
				onClick={handleLineThroughPick}
				margin={0}
			>
				<Icon iconName="TextStrike" />
			</Button>
			<Button
				id="ChangeFontUnderline"
				key="ChangeFontUnderline"
				onClick={handleUnderlinePick}
				margin={0}
			>
				<Icon width={26} iconName="TextUnderline" />
			</Button>
		</>
	);
}
