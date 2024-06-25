import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { CircleColorIndicator } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker/ColorPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "StickerFillStyle";

const stickerColors = [
	"#AED4FA",
	"#FCF5AE",
	"#AFD6A7",
	"#E9BFE9",
	"#ABDDDD",
	"#F6A8A8",
	"#E6E6E6",
];

export function StickerFillStyle(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const color = board.selection.getFillColor();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (color: string) => {
		board.selection.setFillColor(color);
		// TODO: use Storage.ts instead
		const stickerJSON = sessionStorage.getItem("lastSticker");
		if (stickerJSON) {
			const sticker = JSON.parse(stickerJSON);
			sticker.backgroundColor = color;
			sessionStorage.setItem("lastSticker", JSON.stringify(sticker));
		}
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id="sticker-fill-style"
					tooltip={t("contextPanel.stickerColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<CircleColorIndicator
						width={24}
						height={24}
						color={color}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={4}>
				<ColorPicker
					id="sticker-fill"
					selectedColor={color}
					colors={stickerColors}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
