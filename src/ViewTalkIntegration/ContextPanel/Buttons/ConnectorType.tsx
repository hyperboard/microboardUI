import { ConnectorLineStyle } from "Board/Items/Connector";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { ConnectorLineStylePicker } from "ViewTalkIntegration/Pickers/ConnectorLineStylePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { useAppContext } from "View/AppContext";

const MENU_NAME = "ConnectorType";

export function ConnectorType(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { app } = useAppContext();
	const { t } = useTalkTranslation();

	const connectorType = board.selection.getConnectorLineStyle();
	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ConnectorLineStyle): void => {
		app.sessionStorage.setConnectorLineStyle(type);
		board.selection.setConnectorLineStyle(type);
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
					id={"connector-type"}
					tooltip={t("contextPanel.connectorType.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<Icon
						width={18}
						height={18}
						iconName={
							connectorType === "curved"
								? "CurvedLine"
								: "DiagonalLine"
						}
					/>
				</UiButton>
			}
		>
			<UiPanel grid columns={3}>
				<ConnectorLineStylePicker
					onPick={handlePick}
					selected={connectorType}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
