import { ConnectorLineStyle } from "Board/Items/Connector";
import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { ConnectorLineStylePicker } from "ViewUpdate/Pickers/ConnectorLineStylePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu/ButtonWithMenu";

export function AddConnector() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addConnector(true);
	};

	const handlePick = (shape: ConnectorLineStyle) => {
		const tool = board.tools.getAddConnector();
		if (tool) {
			tool.setLineStyle(shape);
		}
	};

	const selectedConnector = board.tools.getAddConnector()?.lineStyle;

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
					variant="secondary"
					rounded="none"
				>
					<Icon iconName="Connector" />
				</UiButton>
			}
			isOpen={isActive}
		>
			<UiPanel vertical padding={0}>
				<ConnectorLineStylePicker
					selected={selectedConnector}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
