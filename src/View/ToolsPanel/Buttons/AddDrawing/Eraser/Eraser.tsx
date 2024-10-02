import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddDrawingContext } from "../AddDrawingContext";

export function Eraser() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(Boolean(board.tools.getEraser()));
	const { setLastOpenedMenu, setSelectedColor } = useAddDrawingContext();

	const addTool = board.tools.getEraser();
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
		board.tools.eraser(true);
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
