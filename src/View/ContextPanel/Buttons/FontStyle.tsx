import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { FontStylePicker } from "View/Pickers/FontStylePicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";

const MENU_NAME = "FontStyle";

export function FontStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTranslation();
	const { board } = useAppContext();

	const fontStyles = board.selection.getText()?.getFontStyles();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (style: string) => {
		board.selection.setFontStyle([style]);
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
					id={"font-style"}
					tooltip={t("contextPanel.fontStyle.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
				>
					<Icon iconName="TextStyle" />
				</UiButton>
			}
		>
			<UiPanel padding={12} gap={8} rounded="bottom">
				<FontStylePicker fontStyles={fontStyles} onPick={handlePick} />
			</UiPanel>
		</ButtonWithMenu>
	);
}
