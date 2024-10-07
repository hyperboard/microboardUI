import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { TextColorIndicator } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { TEXT_COLORS } from "View/Tools/AddText";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Connector } from "../../../Board/Items";

const MENU_NAME = "TextColor";

export function TextColor(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const fontColor = board.selection.getFontColor();

	const connector = board.selection.items.getItemsByItemTypes([
		"Connector",
	])[0] as Connector;
	const context = board.selection.getContext();
	if (
		context !== "EditTextUnderPointer" &&
		connector &&
		!connector.hasText()
	) {
		return null;
	}

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
					id="ChangeTextColor"
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
						id={"TextColor"}
						colors={TEXT_COLORS}
						selectedColor={fontColor}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : fontColor}
						isActive={fontColor !== "none" && !isPredefinedColor}
						toggleMenu={toggleMenu}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
