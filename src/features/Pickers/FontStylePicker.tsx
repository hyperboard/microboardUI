import { TextStyle } from "Board/Items/RichText";
import { getHotkeyLabel } from "Board/Keyboard";
import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
	onPick: (style: TextStyle) => void;
	fontStyles?: string[];
};

export function FontStylePicker({
	onPick,
	fontStyles,
}: Props): React.ReactElement {
	const { t } = useTranslation();

	const handleBoldPick = (): void => {
		onPick("bold");
	};
	const handleItalicsPick = (): void => {
		onPick("italic");
	};
	const handleLineThroughPick = (): void => {
		onPick("line-through");
	};
	const handleUnderlinePick = (): void => {
		onPick("underline");
	};

	const isBold = fontStyles?.includes("bold");
	const isItalic = fontStyles?.includes("italic");
	const isLineThrough = fontStyles?.includes("line-through");
	const isUnderline = fontStyles?.includes("underline");

	return (
		<>
			<UiButton
				id="ChangeFontBold"
				tooltip={t("contextPanel.fontStyle.bold")}
				hotkey={getHotkeyLabel("textBold")}
				tooltipPosition="bottom"
				active={isBold}
				onClick={handleBoldPick}
				variant="secondary"
				size="sm"
			>
				<Icon width={24} height={24} iconName="TextBold" />
			</UiButton>
			<UiButton
				id="ChangeFontItalics"
				tooltip={t("contextPanel.fontStyle.italic")}
				hotkey={getHotkeyLabel("textItalic")}
				tooltipPosition="bottom"
				active={isItalic}
				onClick={handleItalicsPick}
				size="sm"
				variant="secondary"
			>
				<Icon width={24} height={24} iconName="TextItalic" />
			</UiButton>
			<UiButton
				id="ChangeFontUnderline"
				tooltip={t("contextPanel.fontStyle.underline")}
				hotkey={getHotkeyLabel("textUnderline")}
				tooltipPosition="bottom"
				active={isUnderline}
				onClick={handleUnderlinePick}
				size="sm"
				variant="secondary"
			>
				<Icon width={24} height={24} iconName="TextUnderline" />
			</UiButton>
			<UiButton
				id="ChangeFontStrikethrough"
				tooltip={t("contextPanel.fontStyle.strike")}
				hotkey={getHotkeyLabel("textStrike")}
				tooltipPosition="bottom"
				active={isLineThrough}
				onClick={handleLineThroughPick}
				size="sm"
				variant="secondary"
			>
				<Icon width={24} height={24} iconName="TextStrike" />
			</UiButton>
		</>
	);
}
