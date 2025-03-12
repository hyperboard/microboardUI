import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { ConnectorPointerIcon } from "shared/ui-lib/Icon";
import { ConnectorPointerPicker } from "features/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./EndPointer.module.css";
import { useAppContext } from "features/AppContext";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import { ConnectorPointerType } from "shared/ui-lib/Icon/ConnectorPointerIcon";
import btnStyle from "../ContextPanelButton.module.css";
import clsx from "clsx";
import { UiButton } from "shared/ui-lib/UiButton";

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
		app.sessionStorage.setConnectorPointer(type, "end");
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
					hideTooltip={openedMenu === MENU_NAME}
					className={clsx(style.button, btnStyle.contextPanelButton)}
				>
					{pointerStartStyle === "None" ? (
						t("contextPanel.connectorPointerNone")
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
