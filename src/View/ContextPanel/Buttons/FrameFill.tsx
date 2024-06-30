import type { Frame } from "Board/Items";
import React from "react";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { FillColorIndicator } from "View/Icon/FillColorIndicator";
import { FRAME_FILL_COLORS } from "View/Items/Frame";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";

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
