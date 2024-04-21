import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import { Item } from "./Item";
import style from "./RestOptionsMenu.module.css";

const MENU_NAME = "RestOptions";

export function RestOptionsMenu(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight, board } =
		usePanelContext();

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
		<UiButtonWithMenu
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
					<Item onClick={handleDuplicate} hotkey="⌘D">
						Дублировать
					</Item>
				)}
				<Item onClick={handleBringToFront} hotkey="fn↑ (PgUp)">
					Вынести на передний план
				</Item>
				<Item onClick={handleSendToBack} hotkey="fn↓ (PgDn)">
					Вынести на задний план
				</Item>
				{isNotImage && (
					<Item onClick={handleDelete} hotkey="Delete">
						Удалить
					</Item>
				)}
			</UiPanel>
		</UiButtonWithMenu>
	);
}
