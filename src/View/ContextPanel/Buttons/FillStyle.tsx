import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { FillColorIndicator } from "View/Icon/FillColorIndicator";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { FILL_COLORS } from "View/Tools/AddShape";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";

const MENU_NAME = "FillStyle";

export function FillStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();

	const { t } = useTranslation();

	const fillColor = board.selection.getFillColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (color: string) => {
		board.selection.setFillColor(color);
		toggleMenu("None");
	};

	const handleCustomPick = (color: string) => {
		board.selection.setFillColor(color);
	};

	const isPredefinedColor = FILL_COLORS.some(color => color === fillColor);
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id={"fill-style"}
					tooltip={t("contextPanel.fillStyle.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<FillColorIndicator
						width={24}
						height={24}
						color={fillColor}
					/>
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
						id={"fill-style"}
						selectedColor={fillColor}
						colors={FILL_COLORS}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : fillColor}
						isActive={fillColor !== "none" && !isPredefinedColor}
						toggleMenu={toggleMenu}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
