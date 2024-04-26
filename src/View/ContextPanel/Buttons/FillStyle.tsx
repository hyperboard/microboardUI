import { Board } from "Board";
import { Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { CircleIcon } from "View/Icon/CircleIcon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type FillStyleProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
};

export function FillStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
}: FillStyleProps): React.ReactElement | null {
	const { t } = useTranslation();
	const menuRef = React.useRef<HTMLDivElement>(null);

	const context = board.selection.getContext();
	const canChangeFillStyle = board.selection.items.isItemTypes(["Shape"]);
	if (context === "SelectUnderPointer" || !canChangeFillStyle) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("FillStyle");
	};

	const handlePick = (color: string) => {
		board.selection.setFillColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeFillStyle"
				onClick={handleClick}
				title={t(`contextPanel.fillStyle.tooltip`)}
			>
				<CircleIcon
					strokeWidth={1}
					fill={color}
					stroke="rgba(0,0,0,1)"
					width={IconSize}
					height={IconSize}
				/>
			</UiButton>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "FillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker allowNone={true} onPick={handlePick} />
			</div>
		</ButtonWithMenu>
	);
}
