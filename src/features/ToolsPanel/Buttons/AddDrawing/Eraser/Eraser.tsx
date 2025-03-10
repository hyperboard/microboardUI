import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddDrawingContext } from "../AddDrawingContext";
import { UiButton } from "shared/ui-lib/UiButton";

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
			tooltip={
				isActive
					? undefined
					: t("toolsPanel.addDrawing.addEraser.tooltip")
			}
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
