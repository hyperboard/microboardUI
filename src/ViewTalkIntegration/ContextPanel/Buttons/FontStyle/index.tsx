import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import { FontStylePicker } from "ViewTalkIntegration/Pickers/FontStylePicker";

const MENU_NAME = "FontStyle";

export function FontStyle(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (style: string) => {
		board.selection.setFontStyle([style]);
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
				<UiButton onClick={handleClick}>
					<Icon iconName="TextFormat" />
				</UiButton>
			}
		>
			<UiPanel>
				<FontStylePicker onPick={handlePick} />
			</UiPanel>
		</UiButtonWithMenu>
	);
}
