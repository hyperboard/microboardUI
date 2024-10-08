import { ConnectorLineStyle } from "Board/Items/Connector";
import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ConnectorLineStylePicker } from "View/Pickers/ConnectorLineStylePicker";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu/ButtonWithMenu";

export function AddConnector(): React.ReactElement {
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(
		Boolean(board.tools.getAddConnector()),
	);

	const addTool = board.tools.getAddConnector();
	useEffect(() => {
		if (addTool) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [addTool]);

	const handleClick = (): void => {
		board.tools.addConnector(true);
		setIsActive(false);
	};

	const handlePick = (lineStyle: ConnectorLineStyle): void => {
		const tool = board.tools.getAddConnector();
		if (tool) {
			tool.setLineStyle(lineStyle);
			app.sessionStorage.setConnectorLineStyle(lineStyle);
			setIsActive(false);
		}
	};

	const selectedConnector = board.tools.getAddConnector()?.lineStyle;

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-connector"}
					tooltip={t("toolsPanel.addConnector.tooltip")}
					hotkey={getHotkeyLabel("connector")}
					active={isActive || !!addTool}
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
