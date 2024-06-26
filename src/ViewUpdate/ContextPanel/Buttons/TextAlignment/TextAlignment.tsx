import { HorisontalAlignment, VerticalAlignment } from "Board/Items/Alignment";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { Icon } from "ViewUpdate/Icon";
import { HorizontalAlignmentPicker } from "ViewUpdate/Pickers/HorizontalAlignmentPicker";
import { VerticalAlignmentPicker } from "ViewUpdate/Pickers/VerticalAlignmentPicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import { UiSeparator } from "ViewUpdate/Ui/UiSeparator";
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
					id="text-alignment"
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
