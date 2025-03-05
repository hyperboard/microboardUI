import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { FillColorIndicator } from "View/Icon/FillColorIndicator";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { SHAPE_STROKE_COLORS } from "Board/Settings";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import btnStyle from "./ContextPanelButton.module.css";

const MENU_NAME = "ConnectorLineColor";

export function ConnectorLineColor(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board, app } = useAppContext();

	const { t } = useTranslation();

	const connectorLineColor = board.selection.getConnectorLineColor();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (color: string): void => {
		board.selection.setStrokeColor(color);
		app.sessionStorage.setConnectorFillColor(color);
		toggleMenu("None");
	};

	const handleCustomPick = (color: string): void => {
		app.sessionStorage.setConnectorFillColor(color);
		board.selection.setStrokeColor(color);
	};

	const isPredefinedColor = SHAPE_STROKE_COLORS.some(
		color => color === connectorLineColor,
	);

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
					id={"fill-style"}
					tooltip={t("contextPanel.connectorColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<FillColorIndicator
						width={24}
						height={24}
						color={connectorLineColor}
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
						id={"connector-line-color"}
						selectedColor={connectorLineColor}
						colors={SHAPE_STROKE_COLORS}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : connectorLineColor}
						isActive={
							connectorLineColor !== "none" && !isPredefinedColor
						}
						toggleMenu={toggleMenu}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
