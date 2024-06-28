import { HorisontalAlignment, VerticalAlignment } from "Board/Items/Alignment";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { HorizontalAlignmentPicker } from "View/Pickers/HorizontalAlignmentPicker";
import { VerticalAlignmentPicker } from "View/Pickers/VerticalAlignmentPicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import style from "./TextAlignment.module.css";

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

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handleHorizontalPick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalPick = (alignment: VerticalAlignment) => {
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
					id="ChangeTextAlignment"
					tooltip={t("contextPanel.textAlignment.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
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
