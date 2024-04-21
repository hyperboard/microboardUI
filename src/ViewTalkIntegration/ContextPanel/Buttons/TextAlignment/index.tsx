import { HorisontalAlignment } from "Board/Items/Alignment";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { HorisontalAlignmentPicker } from "ViewTalkIntegration/Pickers/HorizontalAlignmentPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";

const MENU_NAME = "TextAlignment";

export function TextAlignment(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const alignment =
		board.selection.getText()?.getHorisontalAlignment() ?? "center";

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
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
					<Icon
						iconName={`TextAlign${
							alignment === "center"
								? "Center"
								: alignment === "left"
								? "Left"
								: "Right"
						}`}
						width={16}
						height={16}
					/>
				</UiButton>
			}
		>
			<UiPanel>
				<HorisontalAlignmentPicker
					alignment={alignment}
					onPick={handlePick}
				/>
			</UiPanel>
		</UiButtonWithMenu>
	);
}
