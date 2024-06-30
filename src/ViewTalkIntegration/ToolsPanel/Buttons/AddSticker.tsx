import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker/ColorPicker";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { ButtonWithMenu } from "./ButtonWithMenu";

const stickerColors = [
	"#AED4FA",
	"#FCF5AE",
	"#AFD6A7",
	"#E9BFE9",
	"#ABDDDD",
	"#F6A8A8",
	"#E6E6E6",
];

export function AddSticker() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.tools.addSticker();
	};

	const handlePick = (color: string) => {
		const tool = board.tools.getAddSticker();
		if (tool) {
			tool.setBackgroundColor(color);
		}
	};

	const isActive = Boolean(board.tools.getAddSticker());
	const stickerColor = board.tools.getAddSticker()?.getBackgroundColor();

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-sticker"}
					tooltip={t("toolsPanel.addSticker.tooltip")}
					hotkey={getHotkeyLabel("sticker")}
					active={isActive}
					onClick={handleClick}
				>
					<Icon width={16} height={16} iconName="Sticker" />
				</UiButton>
			}
			isOpen={isActive}
		>
			<UiPanel grid columns={4}>
				<ColorPicker
					selectedColor={stickerColor}
					colors={stickerColors}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
