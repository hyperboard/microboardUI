import { ConnectorLineStyle } from "Board/Items/Connector";
import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { ConnectorLineStylePicker } from "ViewTalkIntegration/Pickers/ConnectorLineStylePicker";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { ButtonWithMenu } from "./ButtonWithMenu/ButtonWithMenu";

export function AddConnector() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.tools.addConnector();
	};

	const handlePick = (shape: ConnectorLineStyle) => {
		const tool = board.tools.getAddConnector();
		if (tool) {
			tool.setLineStyle(shape);
		}
	};

	const isActive = Boolean(board.tools.getAddConnector());

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-connector"}
					tooltip={t("toolsPanel.addConnector.tooltip")}
					hotkey={getHotkeyLabel("connector")}
					active={isActive}
					onClick={handleClick}
				>
					<Icon width={16} height={16} iconName="Arrow" />
				</UiButton>
			}
			isOpen={isActive}
		>
			<UiPanel vertical>
				<ConnectorLineStylePicker onPick={handlePick} />
			</UiPanel>
		</ButtonWithMenu>
	);
}
