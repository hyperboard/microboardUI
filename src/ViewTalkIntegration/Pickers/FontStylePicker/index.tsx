import { TextStyle } from "Board/Items/RichText";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { Icon } from "ViewTalkIntegration/Icon";

type Props = {
	onPick: (style: TextStyle) => void;
};

export function FontStylePicker({ onPick }: Props): React.ReactElement {
	const handleBoldPick = () => {
		onPick("bold");
	};
	const handleItalicsPick = () => {
		onPick("italic");
	};
	const handleLineThroughPick = () => {
		onPick("line-through");
	};
	const handleUnderlinePick = () => {
		onPick("underline");
	};

	const isBold = props.fontStyles?.includes("bold");
	const isItalic = props.fontStyles?.includes("italic");
	const isLineThrough = props.fontStyles?.includes("line-through");
	const isUnderline = props.fontStyles?.includes("underline");

	return (
		<>
			<UiButton
				id="ChangeFontBold"
				key="ChangeFontBold"
				onClick={handleBoldPick}
			>
				<Icon iconName="TextBold" />
			</UiButton>
			<UiButton
				id="ChangeFontItalics"
				key="ChangeFontItalics"
				onClick={handleItalicsPick}
			>
				<Icon iconName="TextItalic" />
			</UiButton>
			<UiButton
				id="ChangeFontStrikethrough"
				key="ChangeFontStrikethrough"
				onClick={handleLineThroughPick}
			>
				<Icon iconName="TextStrike" />
			</UiButton>
			<UiButton
				id="ChangeFontUnderline"
				key="ChangeFontUnderline"
				onClick={handleUnderlinePick}
			>
				<Icon width={28} height={28} iconName="TextUnderline" />
			</UiButton>
		</>
	);
}
