import React from "react";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { CircleColorIndicator } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker/ColorPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "FillStyle";

const fillColors = [
	"#2291FF",
	"#FFBE00",
	"#3DBC5D",
	"#B750D1",
	"#00CCAE",
	"#F03B36",
	"#FFFFFF",
	"#000000",
	"#F7DF63",
	"#80BF73",
	"#BF7CBF",
	"#3DCCCC",
	"#F26161",
];

export function FillStyle(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const fillColor = board.selection.getFillColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (color: string) => {
		board.selection.setFillColor(color);
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
					tooltip={t("contextPanel.fillStyle.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<CircleColorIndicator
						width={24}
						height={24}
						color={fillColor}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={7}>
				<ColorPicker
					allowNone
					selectedColor={fillColor}
					colors={fillColors}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
