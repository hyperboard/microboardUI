import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { TextColorIndicator } from "ViewUpdate/Icon";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { TEXT_COLORS } from "ViewUpdate/Tools/AddText";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiColorInput } from "ViewUpdate/Ui/UiColorInput";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "TextColor";

export function TextColor(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const fontColor = board.selection.getFontColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (color: string) => {
		board.selection.setFontColor(color);
		toggleMenu("None");
	};

	const handleCustomPick = (color: string) => {
		board.selection.setFontColor(color);
	};

	const isPredefinedColor = TEXT_COLORS.some(color => color === fontColor);
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id="text-color"
					tooltip={t("contextPanel.textColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<TextColorIndicator color={fontColor} />
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
					grid
					columns={4}
					gap={8}
				>
					<ColorPicker
						id={"text"}
						colors={TEXT_COLORS}
						selectedColor={fontColor}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : fontColor}
						isActive={fontColor !== "none" && !isPredefinedColor}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
