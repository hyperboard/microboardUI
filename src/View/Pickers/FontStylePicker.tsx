import { TextStyle } from "Board/Items/RichText";
import * as React from "react";
import { UiButton } from "View/Ui/UiButton";
import { BoldIcon } from "View/Icon/TextStyle/BoldIcon";
import { ItalicsIcon } from "View/Icon/TextStyle/ItalicsIcon";
import { StrikethroughIcon } from "View/Icon/TextStyle/StrikethroughIcon";
import { UnderlineIcon } from "View/Icon/TextStyle/UnderlineIcon";
import { useTranslation } from "react-i18next";

type Props = {
	onPick: (style: TextStyle) => void;
	fontStyles?: string[];
};

export function FontStylePicker(props: Props): React.ReactElement {
	const { t } = useTranslation();
	const isBold = props.fontStyles?.includes("bold");
	const isItalic = props.fontStyles?.includes("italic");
	const isLineThrough = props.fontStyles?.includes("line-through");
	const isUnderline = props.fontStyles?.includes("underline");
	return (
		<>
			<UiButton
				id="ChangeFontBold"
				key="ChangeFontBold"
				title={t("contextPanel.fontStyle.bold")}
				hotkey="Ctrl + B"
				onClick={() => {
					props.onPick("bold");
				}}
				margin={0}
				isOn={isBold}
			>
				<BoldIcon isOn={true} width={24} height={24} />
			</UiButton>
			<UiButton
				id="ChangeFontItalics"
				key="ChangeFontItalics"
				title={t("contextPanel.fontStyle.italic")}
				hotkey="Ctrl + I"
				onClick={() => {
					props.onPick("italic");
				}}
				margin={0}
				isOn={isItalic}
			>
				<ItalicsIcon width={24} height={24} />
			</UiButton>
			<UiButton
				id="ChangeFontUnderline"
				key="ChangeFontUnderline"
				title={t("contextPanel.fontStyle.underline")}
				hotkey="Ctrl + U"
				onClick={() => {
					props.onPick("underline");
				}}
				margin={0}
				tipWidth={140}
				isOn={isUnderline}
			>
				<UnderlineIcon width={24} height={24} />
			</UiButton>
			<UiButton
				id="ChangeFontStrikethrough"
				key="ChangeFontStrikethrough"
				title={t("contextPanel.fontStyle.strike")}
				hotkey="Ctrl + S"
				onClick={() => {
					props.onPick("line-through");
				}}
				margin={0}
				tipWidth={155}
				isOn={isLineThrough}
			>
				<StrikethroughIcon width={24} height={24} />
			</UiButton>
		</>
	);
}
