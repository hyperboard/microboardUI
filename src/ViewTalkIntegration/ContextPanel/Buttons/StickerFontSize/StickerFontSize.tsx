import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { FontSizePicker } from "ViewTalkIntegration/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import style from "./FontSize.module.css";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "FontSize";

const fontSizes = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

export function StickerFontSize() {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();

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
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id={"sticker-font-size"}
					tooltip={t("contextPanel.fontSize.tooltip")}
					tooltipPosition="top"
					className={style.button}
					onClick={handleClick}
				>
					<span className={style.fontSize}>
						{isAuto ? t("contextPanel.fontSize.auto") : fontSize}
					</span>
					<Icon width={10} height={16} iconName="UpDownArrow" />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.sizeList}>
				<FontSizePicker
					id="sticker-font"
					currentFontSize={fontSize}
					fontSizes={fontSizes}
					onPick={handlePick}
					max={maxFontSize}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
