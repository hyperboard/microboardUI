import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { FillColorIndicator } from "ViewUpdate/Icon/FillColorIndicator";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { PEN_COLORS } from "ViewUpdate/Tools/AddDrawing";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiColorInput } from "ViewUpdate/Ui/UiColorInput";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "DrawFillStyle";

export function DrawFillStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { board } = useAppContext();
	const { t } = useTranslation();

	const drawingColor = board.selection.getStrokeColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string) => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};
	const handleCustomPick = (color: string) => {
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
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
