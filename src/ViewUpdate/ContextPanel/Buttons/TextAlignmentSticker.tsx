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
