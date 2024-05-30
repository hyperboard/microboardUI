import { Board } from "Board";
import { Mbr } from "Board/Items";
import { CircleIcon } from "View/Icon/CircleIcon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type StickerFillStyleProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
};

export const stickerColors = {
	"Sky Blue": "rgb(174, 212, 250)",
	"Pale Yellow": "rgb(252, 245, 174)",
	"Sage Green": "rgb(175, 214, 167)",
	Lavender: "rgb(233, 191, 233)",
	"Aqua Cyan": "rgb(171, 221, 221)",
	"Pastel Red": "rgb(246, 168, 168)",
	"Light Gray": "rgb(230, 230, 230)",
} as { [color: string]: string };

export function StickerFillStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
}: StickerFillStyleProps): React.ReactElement | null {
	const { t } = useTranslation();
	const context = board.selection.getContext();
	const menuRef = React.useRef<HTMLDivElement>(null);
	const canChangeFillStyle = board.selection.items.isItemTypes(["Sticker"]);
	if (context === "SelectUnderPointer" || !canChangeFillStyle) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("StickerFillStyle");
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
				id="ChangeStickerFillStyle"
				onClick={handleClick}
				title={t("contextPanel.stickerColor.tooltip")}
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
				id="StickerFillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "170px",
					marginLeft: "-80px",
					visibility:
						menu === "StickerFillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					id={"StickerFillStyle"}
					onPick={(color: string) => {
						board.selection.setFillColor(color);
						// TODO: use Storage.ts instead
						const stickerJSON =
							sessionStorage.getItem("lastSticker");
						if (stickerJSON) {
							const sticker = JSON.parse(stickerJSON);
							sticker.backgroundColor = color;
							sessionStorage.setItem(
								"lastSticker",
								JSON.stringify(sticker),
							);
						}
						toggleMenu("None");
					}}
					list={stickerColors}
				/>
			</div>
		</ButtonWithMenu>
	);
}
