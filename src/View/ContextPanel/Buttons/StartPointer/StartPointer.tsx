import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { ConnectorPointerIcon } from "View/Icon";
import { ConnectorPointerPicker } from "View/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./StartPointer.module.css";
import { useAppContext } from "View/AppContext";
import clsx from "clsx";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import { ConnectorPointerType } from "View/Icon/ConnectorPointerIcon";

const MENU_NAME = "StartPointer";

export function StartPointer(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const pointerStartStyle = board.selection.getStartPointerStyle();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ConnectorPointerStyle): void => {
		board.selection.setStartPointerStyle(type);
		app.storage.setConnectorPointer(type, "start");
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={verticalAlign => (
				<UiButton
					id={"start-pointer"}
					tooltip={t("contextPanel.connectorStartPointer.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="left"
					active={openedMenu === MENU_NAME}
					className={clsx(
						style.button,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuOpened,
					)}
				>
					{pointerStartStyle === "None" ? (
						"None"
					) : (
						<ConnectorPointerIcon
							iconName={pointerStartStyle as ConnectorPointerType}
						/>
					)}
				</UiButton>
			)}
		>
			{verticalAlign => (
				<UiPanel
					grid
					gap={2}
					padding={2}
					columns={2}
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
				>
					<ConnectorPointerPicker
						selected={pointerStartStyle}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
