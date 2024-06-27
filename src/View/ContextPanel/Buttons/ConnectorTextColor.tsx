import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";

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
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();

	const { t } = useTranslation();

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
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id={"connector-text-color"}
					tooltip={t("contextPanel.textColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					{/* <TextColorIndicator
						width={24}
						height={24}
						color={fontColor}
					/> */}
				</UiButton>
			}
		>
			<UiPanel grid columns={4}>
				<ColorPicker
					id={"connector-text"}
					colors={textColors}
					selectedColor={fontColor}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
