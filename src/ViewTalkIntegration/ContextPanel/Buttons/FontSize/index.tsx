import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { FontSizePicker } from "ViewTalkIntegration/Pickers/FontSizePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import style from "./FontSize.module.css";

const MENU_NAME = "FontSize";

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

export function FontSize() {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const fontSize = board.selection.getFontSize();

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
					<span className={style.fontSize}>{fontSize}</span>
					<Icon width={10} height={16} iconName="UpDownArrow" />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.sizeList}>
				<FontSizePicker fontSizes={fontSizes} onPick={handlePick} />
			</UiPanel>
		</UiButtonWithMenu>
	);
}
