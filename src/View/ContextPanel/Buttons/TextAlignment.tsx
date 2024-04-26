import { Board } from "Board";
import { Connector, Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { HorisontalAlignmentPicker } from "View/Pickers/HorisontalAlignmentPicker";
import { VerticalAlignmentPicker } from "View/Pickers/VerticalAlignmentPicker";
import { UiButton } from "View/Ui/UiButton";
import { HorisontalSeparator } from "../HorisontalSeparator";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type TextAlignmentProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
};

export function TextAlignment({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: TextAlignmentProps): React.ReactElement | null {
	const { t } = useTranslation();
	const menuRef = React.useRef<HTMLDivElement>(null);
	const connector = board.selection.items.getSingle();
	const isConnector = connector instanceof Connector;

	if (isConnector) {
		return null;
	}

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
		toggleMenu("TextAlignment");
	};

	const handleHorisontalAlignmentPick = (
		alignment: "left" | "center" | "right",
	) => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalAlignmentPick = (
		alignment: "top" | "bottom" | "center",
	) => {
		board.selection.setVerticalAlignment(alignment);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeTextAlignment"
				onClick={handleClick}
				title={t("contextPanel.textAlignment.tooltip")}
			>
				<Icon
					name="HorisontalAlignCenter"
					width={IconSize}
					height={IconSize}
				/>
			</UiButton>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "130px",
					marginLeft: "-60px",
					visibility: menu === "TextAlignment" ? "visible" : "hidden",
				}}
			>
				<HorisontalAlignmentPicker
					onPick={handleHorisontalAlignmentPick}
				/>
				<HorisontalSeparator />
				<VerticalAlignmentPicker onPick={handleVerticalAlignmentPick} />
			</div>
		</ButtonWithMenu>
	);
}
