import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { Item } from "./Item";
import style from "./RestOptionsMenu.module.css";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { getHotkeyLabel } from "Board/Keyboard/hotkey";

const MENU_NAME = "RestOptions";

export function RestOptionsMenu(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight, board } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const handleClick = () => toggleMenu(MENU_NAME);
	const isNotImage = !board.selection.items.isItemTypes(["Image"]);

	const handleDuplicate = () => {
		board.selection.duplicate();
		toggleMenu("None");
	};
	const handleBringToFront = () => {
		board.selection.bringToFront();
		toggleMenu("None");
	};
	const handleSendToBack = () => {
		board.selection.sendToBack();
		toggleMenu("None");
	};
	const handleDelete = () => {
		board.selection.removeFromBoard();
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			openedMenu={openedMenu}
			menuName={MENU_NAME}
			align="left"
			button={
				<UiButton onClick={handleClick}>
					<Icon iconName="Dots" />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.menu}>
				{isNotImage && (
					<Item
						onClick={handleDuplicate}
						hotkey={getHotkeyLabel("duplicate")}
					>
						{t("contextPanel.duplicate.text")}
					</Item>
				)}
				<Item
					onClick={handleBringToFront}
					hotkey={getHotkeyLabel("bringToFront")}
				>
					{t("contextPanel.bringToFront.text")}
				</Item>
				<Item
					onClick={handleSendToBack}
					hotkey={getHotkeyLabel("sendToBack")}
				>
					{t("contextPanel.sendToBack.text")}
				</Item>
				{isNotImage && (
					<Item
						onClick={handleDelete}
						hotkey={getHotkeyLabel("delete")}
					>
						{t("contextPanel.delete.text")}
					</Item>
				)}
			</UiPanel>
		</ButtonWithMenu>
	);
}
