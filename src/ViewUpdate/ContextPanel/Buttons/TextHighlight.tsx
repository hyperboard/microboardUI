import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { TextHighlightIndicator } from "ViewUpdate/Icon";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { TEXT_HIGHLIGHT_COLORS } from "ViewUpdate/Tools/AddText";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "TextHighlight";

export function TextHighlight(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const highlightColor = board.selection.getFontHighlight();
	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string) => {
		board.selection.setFontHighlight(color);
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
					id="text-highlight"
					tooltip={t("contextPanel.textHighlight.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<TextHighlightIndicator color={highlightColor} />
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
						id={"text-highlight"}
						colors={TEXT_HIGHLIGHT_COLORS}
						selectedColor={highlightColor}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
