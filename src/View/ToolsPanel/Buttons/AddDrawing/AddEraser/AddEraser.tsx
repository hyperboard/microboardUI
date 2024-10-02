import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { STICKER_COLORS } from "View/Tools/AddSticker";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddDrawingContext } from "../AddDrawingContext";

export function AddEraser() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(
		Boolean(board.tools.getAddEraser()),
	);
	const { setLastOpenedMenu, setSelectedColor } = useAddDrawingContext();

	const addTool = board.tools.getAddEraser();
	useEffect(() => {
		if (addTool) {
			setSelectedColor("none");
			setLastOpenedMenu("Eraser");
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [addTool]);

	const handleClick = () => {
		board.tools.addEraser(true);
	};

	return (
		<UiButton
			id={"tool-add-eraser"}
			tooltip={t("toolsPanel.addDrawing.addEraser.tooltip")}
			hotkey={getHotkeyLabel("eraser")}
			active={isActive || !!addTool}
			onClick={handleClick}
			variant="secondary"
			rounded="bottom"
		>
			<Icon iconName="Eraser" />
		</UiButton>
	);
}
