import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { Icon } from "ViewUpdate/Icon";
import { FontStylePicker } from "ViewUpdate/Pickers/FontStylePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";

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
