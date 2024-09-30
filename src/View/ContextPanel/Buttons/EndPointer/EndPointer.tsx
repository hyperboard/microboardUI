import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { ConnectorPointerIcon } from "View/Icon";
import { ConnectorPointerPicker } from "View/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./EndPointer.module.css";
import { useAppContext } from "View/AppContext";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import { ConnectorPointerType } from "View/Icon/ConnectorPointerIcon";

const MENU_NAME = "EndPointer";

export function EndPointer(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const pointerStartStyle = board.selection.getEndPointerStyle();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ConnectorPointerStyle): void => {
		board.selection.setEndPointerStyle(type);
		app.storage.setConnectorPointer(type, "end");
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
					id={"end-pointer"}
					tooltip={t("contextPanel.connectorEndPointer.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
					className={style.button}
				>
					{pointerStartStyle === "None" ? (
						"None"
					) : (
						<ConnectorPointerIcon
							iconName={pointerStartStyle as ConnectorPointerType}
						/>
					)}
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					grid
					padding={0}
					columns={2}
					className={style[verticalAlign]}
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
