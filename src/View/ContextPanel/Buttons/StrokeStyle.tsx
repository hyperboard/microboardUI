import { Board } from "Board";
import { Mbr } from "Board/Items";
import { BorderStyle } from "Board/Items/Path";
import React from "react";
import { useTranslation } from "react-i18next";
import { CircleIcon } from "View/Icon/CircleIcon";
import { StrokeStylePicker } from "View/Pickers/BorderStylePicker";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

type StrokeStyleProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	color: string;
	width: number;
};

export function StrokeStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
	width,
}: StrokeStyleProps): React.ReactElement | null {
	const { t } = useTranslation();
	const context = board.selection.getContext();
	const menuRef = React.useRef<HTMLDivElement>(null);

	const canChangeBorderStyle = board.selection.items.isItemTypes([
		"Shape",
		"Drawing",
	]);
	if (context === "SelectUnderPointer" || !canChangeBorderStyle) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("StrokeStyle");
	};

	const handleStrokeWidthPick = (width: number) => {
		board.selection.setStrokeWidth(width);
	};

	const handleStrokeStylePick = (style: BorderStyle) => {
		board.selection.setStrokeStyle(style);
		toggleMenu("None");
	};

	const handleStrokeColorPick = (color: string) => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeStrokeStyle"
				onClick={handleClick}
				title={t("contextPanel.strokeStyle.tooltip")}
			>
				<CircleIcon
					fill="white"
					stroke={color}
					strokeWidth={12}
					width={20}
					height={20}
				/>
			</UiButton>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "StrokeStyle" ? "visible" : "hidden",
				}}
			>
				<SliderPicker onPick={handleStrokeWidthPick} width={width} />
				<StrokeStylePicker onPick={handleStrokeStylePick} />
				<ColorPicker allowNone={false} onPick={handleStrokeColorPick} />
			</div>
		</ButtonWithMenu>
	);
}
