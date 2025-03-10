import { HorisontalAlignment, VerticalAlignment } from "Board/Items/Alignment";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { Icon } from "shared/ui-lib/Icon";
import { HorizontalAlignmentPicker } from "features/Pickers/HorizontalAlignmentPicker";
import { VerticalAlignmentPicker } from "features/Pickers/VerticalAlignmentPicker";
import { UiButton } from "features/Ui/UiButton/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "./ContextPanelButton.module.css";

const MENU_NAME = "TextAlignmentSticker";

export function TextAlignmentSticker(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTranslation();
	const { board } = useAppContext();

	const horizontalAlignment =
		board.selection.getText()?.getHorisontalAlignment() ?? "center";
	const verticalAlignment =
		board.selection.getText()?.getVerticalAlignment() ?? "center";

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handleHorisontalAlignmentPick = (
		alignment: HorisontalAlignment,
	): void => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalAlignmentPick = (
		alignment: VerticalAlignment,
	): void => {
		board.selection.setVerticalAlignment(alignment);
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
					className={btnStyle.contextPanelButton}
					id={"sticker-text-alignment"}
					tooltip={t("contextPanel.textAlignment.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<Icon
						iconName={`TextAlign${
							horizontalAlignment === "center"
								? "Center"
								: horizontalAlignment === "left"
									? "Left"
									: "Right"
						}`}
						width={16}
						height={16}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={3}>
				<HorizontalAlignmentPicker
					alignment={horizontalAlignment}
					onPick={handleHorisontalAlignmentPick}
				/>
				<VerticalAlignmentPicker
					alignment={verticalAlignment}
					onPick={handleVerticalAlignmentPick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
