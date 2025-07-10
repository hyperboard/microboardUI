import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { Icon } from "shared/ui-lib/Icon";
import { FontStylePicker } from "features/Pickers/FontStylePicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

const MENU_NAME = "FontStyle";

export function FontStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTranslation();
	const { board } = useAppContext();

	const fontStyles = board.selection.getText()?.getFontStyles();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (style: string): void => {
		board.selection.setFontStyle(style);
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
					id={"ChangeFontStyle"}
					tooltip={t("contextPanel.fontStyle.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
					hideTooltip={openedMenu === MENU_NAME}
				>
					<Icon iconName="TextStyle" />
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					padding={12}
					gap={8}
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
				>
					<FontStylePicker
						fontStyles={fontStyles}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
