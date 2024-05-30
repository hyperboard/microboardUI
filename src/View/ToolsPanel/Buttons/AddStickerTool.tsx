import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
};

const stickerColors = {
	"Sky Blue": "rgb(174, 212, 250)",
	"Pale Yellow": "rgb(252, 245, 174)",
	"Sage Green": "rgb(175, 214, 167)",
	Lavender: "rgb(233, 191, 233)",
	"Aqua Cyan": "rgb(171, 221, 221)",
	"Pastel Red": "rgb(246, 168, 168)",
	"Light Gray": "rgb(230, 230, 230)",
} as { [color: string]: string };

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
					id={"Sticker"}
					allowNone={false}
					onPick={handlePick}
					list={stickerColors}
				/>
			</div>
		</div>
	);
}
