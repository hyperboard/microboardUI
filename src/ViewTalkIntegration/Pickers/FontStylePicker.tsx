import { TextStyle } from "Board/Items/RichText";
import * as React from "react";
import { Button } from "../ContextPanel";
import { Icon } from "../Icon";

interface Props {
	onPick: (style: TextStyle) => void;
	fontStyles?: string[];
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

	const isBold = props.fontStyles?.includes("bold");
	const isItalic = props.fontStyles?.includes("italic");
	const isLineThrough = props.fontStyles?.includes("line-through");
	const isUnderline = props.fontStyles?.includes("underline");

	return (
		<>
			<Button
				id="ChangeFontBold"
				key="ChangeFontBold"
				onClick={handleBoldPick}
				margin={0}
				title="Жирный"
				hotkey="⌘B"
				isOn={isBold}
			>
				<Icon iconName="TextBold" />
			</Button>
			<Button
				id="ChangeFontItalics"
				key="ChangeFontItalics"
				onClick={handleItalicsPick}
				margin={0}
				title="Курсив"
				hotkey="⌘I"
				isOn={isItalic}
			>
				<Icon iconName="TextItalic" />
			</Button>
			<Button
				id="ChangeFontStrikethrough"
				key="ChangeFontStrikethrough"
				onClick={handleLineThroughPick}
				margin={0}
				title="Зачеркнутый"
				hotkey="⌘S"
				isOn={isLineThrough}
			>
				<Icon iconName="TextStrike" />
			</Button>
			<Button
				id="ChangeFontUnderline"
				key="ChangeFontUnderline"
				onClick={handleUnderlinePick}
				margin={0}
				title="Подчеркнутый"
				hotkey="⌘U"
				isOn={isUnderline}
			>
				<Icon width={26} iconName="TextUnderline" />
			</Button>
		</>
	);
}
