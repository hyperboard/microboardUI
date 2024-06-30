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

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handleHorisontalAlignmentPick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalAlignmentPick = (alignment: VerticalAlignment) => {
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
