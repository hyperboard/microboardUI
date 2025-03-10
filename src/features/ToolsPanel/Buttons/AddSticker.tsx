import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { STICKER_COLORS } from "Board/Settings";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { UiButton } from "shared/ui-lib/UiButton";

export function AddSticker() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(
		Boolean(board.tools.getAddConnector()),
	);

	const addTool = board.tools.getAddSticker();
	useEffect(() => {
		if (addTool) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [addTool]);

	const handleClick = () => {
		board.tools.addSticker(true);
		setIsActive(false);
	};

	const handlePick = (color: string) => {
		const tool = board.tools.getAddSticker();
		if (tool) {
			tool.setBackgroundColor(color);
			setIsActive(false);
		}
	};

	const selectedColor = board.tools.getAddSticker()?.getBackgroundColor();

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-sticker"}
					tooltip={
						isActive
							? undefined
							: t("toolsPanel.addSticker.tooltip")
					}
					hotkey={getHotkeyLabel("sticker")}
					active={isActive || !!addTool}
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
