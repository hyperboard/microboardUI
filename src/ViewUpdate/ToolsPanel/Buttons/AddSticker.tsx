import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { STICKER_COLORS } from "ViewUpdate/Tools/AddSticker";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu";

export function AddSticker() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addSticker(true);
	};

	const handlePick = (color: string) => {
		const tool = board.tools.getAddSticker();
		if (tool) {
			tool.setBackgroundColor(color);
		}
	};

	const isActive = Boolean(board.tools.getAddSticker());
	const selectedColor = board.tools.getAddSticker()?.getBackgroundColor();

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-sticker"}
					tooltip={t("toolsPanel.addSticker.tooltip")}
					hotkey={getHotkeyLabel("sticker")}
					active={isActive}
					onClick={handleClick}
					variant="secondary"
					rounded="none"
				>
					<Icon iconName="Sticker" />
				</UiButton>
			}
			isOpen={isActive}
		>
			<UiPanel grid columns={2}>
				<ColorPicker
					selectedColor={selectedColor}
					colors={STICKER_COLORS}
					onPick={handlePick}
					variant="square"
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
