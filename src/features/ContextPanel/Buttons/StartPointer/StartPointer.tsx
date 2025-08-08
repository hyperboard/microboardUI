import { ConnectorPointerStyle } from "microboard-temp";
import clsx from "clsx";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { ConnectorPointerPicker } from "features/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import React from "react";
import { useTranslation } from "react-i18next";
import { ConnectorPointerIcon } from "shared/ui-lib/Icon";
import { ConnectorPointerType } from "shared/ui-lib/Icon/ConnectorPointerIcon";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "../ContextPanelButton.module.css";
import style from "./StartPointer.module.css";

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
		app.sessionStorage.setConnectorPointer(type, "start");
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
					hideTooltip={openedMenu === MENU_NAME}
					className={clsx(
						btnStyle.contextPanelButton,
						style.button,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuOpened,
					)}
				>
					{/* {pointerStartStyle === "None" ? (
						t("contextPanel.connectorPointerNone")
					) : (
						<ConnectorPointerIcon
							iconName={pointerStartStyle as ConnectorPointerType}
						/>
					)} */}
					<ConnectorPointerIcon
						iconName={pointerStartStyle as ConnectorPointerType}
					/>
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
