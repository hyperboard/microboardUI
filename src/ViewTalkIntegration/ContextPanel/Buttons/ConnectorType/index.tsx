import { ConnectorLineStyle } from "Board/Items/Connector";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { ConnectorLineStylePicker } from "ViewTalkIntegration/Pickers/ConnectorLineStylePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";

const MENU_NAME = "ConnectorType";

export function ConnectorType(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const connectorType = board.selection.getConnectorLineStyle();
	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ConnectorLineStyle) => {
		board.selection.setConnectorLineStyle(type);
		toggleMenu("None");
	};
	return (
		<UiButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton onClick={handleClick}>
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
		</UiButtonWithMenu>
	);
}
