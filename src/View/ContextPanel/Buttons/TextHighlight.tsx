import React from "react";
import { Board } from "Board";
import { Mbr } from "Board/Items";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { UiButton } from "View/Ui/UiButton";
import { TextHighlightIcon } from "View/Icon/TextStyle/TextHighlightIcon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { useTranslation } from "react-i18next";

const IconSize = 24;

type TextHighlightProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	color: string;
};

export function TextHighlight({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
}: TextHighlightProps): React.ReactElement | null {
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

	const handleClick = () => {
		toggleMenu("TextHighlight");
	};

	const handlePick = (color: string) => {
		board.selection.setFontHighlight(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeTextHighlight"
				onClick={handleClick}
				title={t("contextPanel.textHighlight.tooltip")}
			>
				<TextHighlightIcon
					color={color}
					width={IconSize}
					height={IconSize}
				/>
			</UiButton>
			<div
				id="TextColorMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "TextHighlight" ? "visible" : "hidden",
				}}
			>
				<ColorPicker allowNone={true} onPick={handlePick} />
			</div>
		</ButtonWithMenu>
	);
}
