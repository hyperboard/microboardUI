import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { FontSizePicker } from "ViewTalkIntegration/Pickers/FontSizePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import style from "./FontSize.module.css";

const MENU_NAME = "FontSize";

const fontSizes = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

export function StickerFontSize() {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const fontSize = board.selection.getFontSize();
	const text = board.selection.getText();
	const maxFontSize = text?.getMaxFontSize();
	const isAuto = text?.getAutosize();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (size: number) => {
		board.selection.setFontSize(size);
		toggleMenu("None");
	};

	return (
		<UiButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton className={style.button} onClick={handleClick}>
					<span className={style.fontSize}>
						{isAuto ? "Авто" : fontSize}
					</span>
					<Icon width={10} height={16} iconName="UpDownArrow" />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.sizeList}>
				<FontSizePicker
					fontSizes={fontSizes}
					onPick={handlePick}
					max={maxFontSize}
				/>
			</UiPanel>
		</UiButtonWithMenu>
	);
}
