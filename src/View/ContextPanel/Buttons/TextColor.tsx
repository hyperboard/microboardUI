import { Board } from "Board";
import { Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { TextColorIcon } from "View/Icon/TextStyle/TextColorIcon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type TextColorProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
};

export function TextColor({
	board,
	toggleMenu,
	menu,
	panelMbr,
	color,
	windowHeight,
}: TextColorProps): React.ReactElement | null {
	const { t } = useTranslation();
	const menuRef = React.useRef<HTMLDivElement>(null);
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("TextColor");
	};

	const handlePick = (color: string) => {
		board.selection.setFontColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeTextColor"
				onClick={handleClick}
				title={t("contextPanel.textColor.tooltip")}
			>
				<TextColorIcon
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
					width: "170px",
					marginLeft: "-80px",
					visibility: menu === "TextColor" ? "visible" : "hidden",
				}}
			>
				<ColorPicker allowNone={false} onPick={handlePick} />
			</div>
		</ButtonWithMenu>
	);
}
