import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { FillColorIndicator } from "View/Icon/FillColorIndicator";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { STICKER_COLORS } from "View/Tools/AddSticker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { Sticker } from "Board/Items/Sticker";

const MENU_NAME = "StickerFillStyle";

export function StickerFillStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const color = board.selection.getFillColor();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string): void => {
		board.selection.setFillColor(color);
		const sticker = board.selection.items.getSingle();
		if (sticker && sticker instanceof Sticker) {
			sticker.saveStickerData();
		}
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					className={btnStyle.contextPanelButton}
					id="sticker-fill-style"
					tooltip={t("contextPanel.stickerColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
				>
					<FillColorIndicator color={color} />
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
					grid
					columns={5}
					gap={8}
				>
					<ColorPicker
						id="sticker-fill"
						selectedColor={color}
						colors={STICKER_COLORS}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
