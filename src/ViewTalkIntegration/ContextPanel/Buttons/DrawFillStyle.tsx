import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { CircleColorIndicator } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker/ColorPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import React from "react";

const MENU_NAME = "DrawFillStyle";

const drawingColors = [
	"#2291FF",
	"#FFBE00",
	"#00CCAE",
	"#3DBC5D",
	"#B750D1",
	"#F03B36",
	"#000000",
	"#FFFFFF",
];

export function DrawFillStyle(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const color = board.selection.getStrokeColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string) => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};
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
				>
					<CircleColorIndicator
						width={24}
						height={24}
						color={color}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={4}>
				<ColorPicker
					id={"drawing"}
					selectedColor={color}
					colors={drawingColors}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
