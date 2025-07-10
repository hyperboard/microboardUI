import type { ConnectorLineStyle } from "microboard-temp";
import { getHotkeyLabel } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { ConnectorLineStylePicker } from "features/Pickers/ConnectorLineStylePicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu/ButtonWithMenu";
import { UiButton } from "shared/ui-lib/UiButton";

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
			tool.applyLineStyle(lineStyle);
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
					tooltip={
						isActive
							? undefined
							: t("toolsPanel.addConnector.tooltip")
					}
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
