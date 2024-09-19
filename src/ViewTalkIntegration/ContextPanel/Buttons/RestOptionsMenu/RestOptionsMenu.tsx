import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { Item } from "./Item";
import style from "./RestOptionsMenu.module.css";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { getHotkeyLabel } from "Board/Keyboard";

const MENU_NAME = "RestOptions";

export function RestOptionsMenu(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight, board } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const handleClick = () => toggleMenu(MENU_NAME);
	const isNotImage = !board.selection.items.isItemTypes(["Image"]);

	const handleCopy = () => {
		const data = board.selection.copy();
		const text = JSON.stringify(data);
		navigator.clipboard.writeText(text).finally(() => {
			toggleMenu("None");
		});
	};
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
				<UiButton id={"options-menu"} onClick={handleClick}>
					<Icon iconName="Dots" />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.menu}>
				<Item
					id="options-menu-copy"
					onClick={handleCopy}
					hotkey={getHotkeyLabel("copy")}
				>
					{t("contextPanel.copy.text")}
				</Item>
				{isNotImage && (
					<Item
						id="options-menu-duplicate"
						onClick={handleDuplicate}
						hotkey={getHotkeyLabel("duplicate")}
					>
						{t("contextPanel.duplicate.text")}
					</Item>
				)}
				<Item
					id="options-menu-bring-to-front"
					onClick={handleBringToFront}
					hotkey={getHotkeyLabel("bringToFront")}
				>
					{t("contextPanel.bringToFront.text")}
				</Item>
				<Item
					id="options-menu-send-to-back"
					onClick={handleSendToBack}
					hotkey={getHotkeyLabel("sendToBack")}
				>
					{t("contextPanel.sendToBack.text")}
				</Item>
				{isNotImage && (
					<Item
						id="options-menu-delete"
						className={style.delete}
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
