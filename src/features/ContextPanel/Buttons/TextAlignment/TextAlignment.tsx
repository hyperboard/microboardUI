import { HorisontalAlignment, VerticalAlignment } from "microboard-temp";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { Icon } from "shared/ui-lib/Icon";
import { HorizontalAlignmentPicker } from "features/Pickers/HorizontalAlignmentPicker";
import { VerticalAlignmentPicker } from "features/Pickers/VerticalAlignmentPicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import style from "./TextAlignment.module.css";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

const MENU_NAME = "TextAlignment";

export function TextAlignment(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const alignment =
		board.selection.getText()?.getHorisontalAlignment() ?? "center";
	const vertical =
		board.selection.getText()?.getVerticalAlignment() ?? "center";

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handleHorizontalPick = (alignment: HorisontalAlignment): void => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalPick = (alignment: VerticalAlignment): void => {
		board.selection.setVerticalAlignment(alignment);
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
					className={btnStyle.contextPanelButton}
					id="ChangeTextAlignment"
					tooltip={t("contextPanel.textAlignment.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					hideTooltip={openedMenu === MENU_NAME}
					rounded="none"
				>
					<Icon
						iconName={`TextAlign${
							alignment === "center"
								? "Center"
								: alignment === "left"
									? "Left"
									: "Right"
						}`}
					/>
				</UiButton>
			}
		>
			{verticalAlignment => (
				<UiPanel
					rounded={verticalAlignment === "bottom" ? "bottom" : "full"}
					vertical
					padding={12}
					gap={8}
				>
					<div className={style.section}>
						<HorizontalAlignmentPicker
							alignment={alignment}
							onPick={handleHorizontalPick}
						/>
					</div>
					<UiSeparator />
					<div className={style.section}>
						<VerticalAlignmentPicker
							alignment={vertical}
							onPick={handleVerticalPick}
						/>
					</div>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
