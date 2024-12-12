import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { FillColorIndicator } from "View/Icon/FillColorIndicator";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { PEN_COLORS } from "View/Tools/AddDrawing";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";

const MENU_NAME = "DrawFillStyle";

export function DrawFillStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { board } = useAppContext();
	const { t } = useTranslation();

	const drawingColor = board.selection.getStrokeColor();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string): void => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};
	const handleCustomPick = (color: string): void => {
		board.selection.setStrokeColor(color);
	};

	const isPredefinedColor = PEN_COLORS.some(color => color === drawingColor);
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="center"
			button={
				<UiButton
					id={"drawing-fill-style"}
					tooltip={t("contextPanel.penColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<FillColorIndicator color={drawingColor} />
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
						id={"drawing"}
						selectedColor={drawingColor}
						colors={PEN_COLORS}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : drawingColor}
						isActive={drawingColor !== "none" && !isPredefinedColor}
						toggleMenu={toggleMenu}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
