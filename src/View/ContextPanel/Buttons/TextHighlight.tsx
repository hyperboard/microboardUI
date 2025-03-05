import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { TextHighlightIndicator } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { TEXT_HIGHLIGHT_COLORS } from "Board/Settings";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { UiColorInput } from "View/Ui/UiColorInput";
import { convertHexToRGBA } from "utils";
import btnStyle from "./ContextPanelButton.module.css";

const MENU_NAME = "TextHighlight";

export function TextHighlight(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const highlightColor = board.selection.getFontHighlight();
	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string): void => {
		board.selection.setFontHighlight(color);
		toggleMenu("None");
	};
	const handleCustomPick = (color: string): void => {
		const rgbColor = convertHexToRGBA(color, false);
		board.selection.setFontHighlight(rgbColor);
	};
	const isPredefinedColor = TEXT_HIGHLIGHT_COLORS.includes(highlightColor);
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
					id="ChangeTextHighlight"
					tooltip={t("contextPanel.textHighlight.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<TextHighlightIndicator color={highlightColor} />
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
						id={"TextHighlight"}
						colors={TEXT_HIGHLIGHT_COLORS}
						selectedColor={highlightColor}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : highlightColor}
						isActive={
							highlightColor !== "none" && !isPredefinedColor
						}
						toggleMenu={toggleMenu}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
