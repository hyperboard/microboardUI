import { TextStyle } from "Board/Items/RichText";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { Icon } from "ViewTalkIntegration/Icon";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { getHotkeyLabel } from "Board/Keyboard";

type Props = {
	onPick: (style: TextStyle) => void;
	fontStyles?: string[];
};

export function FontStylePicker({
	onPick,
	fontStyles,
}: Props): React.ReactElement {
	const { t } = useTalkTranslation();

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

	const isBold = fontStyles?.includes("bold");
	const isItalic = fontStyles?.includes("italic");
	const isLineThrough = fontStyles?.includes("line-through");
	const isUnderline = fontStyles?.includes("underline");

	return (
		<>
			<UiButton
				id="font-style-bold"
				tooltip={t("contextPanel.fontStyle.bold")}
				hotkey={getHotkeyLabel("textBold")}
				tooltipPosition="bottom"
				active={isBold}
				onClick={handleBoldPick}
			>
				<Icon iconName="TextBold" />
			</UiButton>
			<UiButton
				id="font-style-italic"
				tooltip={t("contextPanel.fontStyle.italic")}
				hotkey={getHotkeyLabel("textItalic")}
				tooltipPosition="bottom"
				active={isItalic}
				onClick={handleItalicsPick}
			>
				<Icon iconName="TextItalic" />
			</UiButton>
			<UiButton
				id="font-style-strike"
				tooltip={t("contextPanel.fontStyle.strike")}
				hotkey={getHotkeyLabel("textStrike")}
				tooltipPosition="bottom"
				active={isLineThrough}
				onClick={handleLineThroughPick}
			>
				<Icon iconName="TextStrike" />
			</UiButton>
			<UiButton
				id="font-style-underline"
				tooltip={t("contextPanel.fontStyle.underline")}
				hotkey={getHotkeyLabel("textUnderline")}
				tooltipPosition="bottom"
				active={isUnderline}
				onClick={handleUnderlinePick}
			>
				<Icon width={28} height={28} iconName="TextUnderline" />
			</UiButton>
		</>
	);
}
