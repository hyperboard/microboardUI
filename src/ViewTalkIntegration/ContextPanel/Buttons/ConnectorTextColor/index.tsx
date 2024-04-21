import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { TextColorIndicator } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";

const MENU_NAME = "TextColor";

const textColors = [
	"#000000",
	"#F03B36",
	"#FFBE00",
	"#3DBC5D",
	"#B750D1",
	"#00CCAE",
	"#2291FF",
	"#FFFFFF",
];

export function ConnectorTextColor(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const context = board.selection.getContext();
	if (context !== "EditTextUnderPointer") {
		return null;
	}

	const fontColor = board.selection.getFontColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (color: string) => {
		board.selection.setFontColor(color);
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
					<TextColorIndicator
						width={24}
						height={24}
						color={fontColor}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={4}>
				<ColorPicker
					colors={textColors}
					selectedColor={fontColor}
					onPick={handlePick}
				/>
			</UiPanel>
		</UiButtonWithMenu>
	);
}
