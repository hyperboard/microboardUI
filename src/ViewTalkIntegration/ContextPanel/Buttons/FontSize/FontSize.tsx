import React from "react";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { FontSizePicker } from "ViewTalkIntegration/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./FontSize.module.css";

const MENU_NAME = "FontSize";

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

export function FontSize() {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTalkTranslation();

	const fontSize = board.selection.getFontSize();

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
					id="pick-font-size"
					tooltip={t("contextPanel.fontSize.tooltip")}
					tooltipPosition="top"
					className={style.button}
					onClick={handleClick}
				>
					<span className={style.fontSize}>{fontSize}</span>
					<Icon width={10} height={16} iconName="UpDownArrow" />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.sizeList}>
				<FontSizePicker
					id={"context-panel"}
					currentFontSize={fontSize}
					fontSizes={fontSizes}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
