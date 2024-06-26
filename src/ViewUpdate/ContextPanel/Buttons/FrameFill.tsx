import type { Frame } from "Board/Items";
import React from "react";
import { useAppContext } from "ViewUpdate/AppContext";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { FillColorIndicator } from "ViewUpdate/Icon/FillColorIndicator";
import { FRAME_FILL_COLORS } from "ViewUpdate/Items/Frame";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiColorInput } from "ViewUpdate/Ui/UiColorInput";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";

const MENU_NAME = "FrameFill";

export function FrameFill(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();

	const frame = board.selection.items.getSingle() as Frame;
	const fillColor = frame.getBackgroundColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (color: string) => {
		frame.setBackgroundColor(color);
		toggleMenu("None");
	};

	const handleCustomPick = (color: string) => {
		frame.setBackgroundColor(color);
	};

	const isPredefinedColor = FRAME_FILL_COLORS.some(
		color => color === fillColor,
	);

	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id={"fill-style"}
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<FillColorIndicator
						width={24}
						height={24}
						color={fillColor}
					/>
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
						id={"fill-style"}
						selectedColor={fillColor}
						colors={FRAME_FILL_COLORS}
						onPick={handlePick}
					/>
					<UiColorInput
						onChange={handleCustomPick}
						color={isPredefinedColor ? "none" : fillColor}
						isActive={fillColor !== "none" && !isPredefinedColor}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
