import { Board } from "Board";
import { stickerColors } from "Board/Items/Sticker";
import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
};

export function AddStickerTool({ board, isOn }: Props) {
	const { t } = useTranslation();

	const handleClick = (): void => {
		board.tools.addSticker();
	};

	const handlePick = (color: string): void => {
		const add = board.tools.getAddSticker();
		if (add) {
			add.setBackgroundColor(color);
		}
	};

	return (
		<div className="ToolsPanelMenuContainer">
			<UiButton
				id="AddSticker"
				onClick={handleClick}
				title={t("toolsPanel.addSticker.tooltip")}
				hotkey={getHotkeyLabel("sticker")}
				isOn={isOn}
				tipOnLeft
			>
				<Icon name="Sticker" width={28} height={28} />
			</UiButton>
			<div
				id="AddStickerMenu"
				className="ToolsPanelMenu"
				style={{
					visibility: isOn ? "visible" : "hidden",
					marginTop: "-194px",
				}}
			>
				<ColorPicker
					allowNone={false}
					onPick={handlePick}
					list={stickerColors}
				/>
			</div>
		</div>
	);
}
