import { Board } from "Board";
import { Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { BoldUnderlineIcon } from "View/Icon/TextStyle/BoldUnderlineIcon";
import { FontStylePicker } from "View/Pickers/FontStylePicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type FontStyleProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
};

export function FontStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: FontStyleProps): React.ReactElement | null {
	const { t } = useTranslation();
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);
	const fontStyles = board.selection.getText()?.getFontStyles();
	const handleClick = () => {
		toggleMenu("FontStyle");
	};

	const handlePick = (style: string) => {
		board.selection.setFontStyle([style]);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeFontStyle"
				onClick={handleClick}
				title={t("contextPanel.fontStyle.tooltip")}
			>
				<BoldUnderlineIcon width={IconSize} height={IconSize} />
			</UiButton>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "170px",
					marginLeft: "-80px",
					visibility: menu === "FontStyle" ? "visible" : "hidden",
				}}
			>
				<FontStylePicker fontStyles={fontStyles} onPick={handlePick} />
			</div>
		</ButtonWithMenu>
	);
}
