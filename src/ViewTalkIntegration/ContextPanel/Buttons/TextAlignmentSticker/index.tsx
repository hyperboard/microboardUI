import { HorisontalAlignment, VerticalAlignment } from "Board/Items/Alignment";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { HorisontalAlignmentPicker } from "ViewTalkIntegration/Pickers/HorizontalAlignmentPicker";
import { VerticalAlignmentPicker } from "ViewTalkIntegration/Pickers/VerticalAlignmentPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";

const MENU_NAME = "TextAlignmentSticker";

export function TextAlignmentSticker(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const horizontalAlignment =
		board.selection.getText()?.getHorisontalAlignment() ?? "center";
	const verticalAlignment =
		board.selection.getText()?.getVerticalAlignment() ?? "center";

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handleHorisontalAlignmentPick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalAlignmentPick = (alignment: VerticalAlignment) => {
		board.selection.setVerticalAlignment(alignment);
		toggleMenu("None");
	};

	return (
		<UiButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="center"
			button={
				<UiButton onClick={handleClick}>
					<Icon
						iconName={`TextAlign${
							horizontalAlignment === "center"
								? "Center"
								: horizontalAlignment === "left"
								? "Left"
								: "Right"
						}`}
						width={16}
						height={16}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={3}>
				<HorisontalAlignmentPicker
					alignment={horizontalAlignment}
					onPick={handleHorisontalAlignmentPick}
				/>
				<VerticalAlignmentPicker
					alignment={verticalAlignment}
					onPick={handleVerticalAlignmentPick}
				/>
			</UiPanel>
		</UiButtonWithMenu>
	);
}
