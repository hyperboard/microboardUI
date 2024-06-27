import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { FontSizePicker } from "View/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSize.module.css";
import { useAppContext } from "View/AppContext";

const MENU_NAME = "FontSize";

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

export function ConnectorFontSize() {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { board } = useAppContext();
	const { t } = useTranslation();

	const context = board.selection.getContext();
	if (context !== "EditTextUnderPointer") {
		return null;
	}

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
					id={"connector-font-size"}
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
					id="connector-font"
					currentFontSize={fontSize}
					fontSizes={fontSizes}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
