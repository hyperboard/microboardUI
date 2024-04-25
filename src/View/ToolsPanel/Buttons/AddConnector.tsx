import { Board } from "Board";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { getHotkeyLabel } from "Board/Keyboard/hotkey";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ConnectorLineStylePicker } from "View/Pickers/ConnectorLineStylePicker";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
};

export function AddConnector({ board, isOn }: Props) {
	const { t } = useTranslation();

	const handleClick = (): void => {
		board.tools.addConnector();
	};

	const handlePickLineStyle = (lineStyle: ConnectorLineStyle): void => {
		const addConnector = board.tools.getAddConnector();
		if (addConnector) {
			addConnector.setLineStyle(lineStyle);
		}
	};

	const isAddConnectorOn = board.tools.getAddConnector() !== undefined;

	return (
		<div className="ToolsPanelMenuContainer">
			<UiButton
				id="AddConnector"
				onClick={handleClick}
				title={t("toolsPanel.addConnector.tooltip")}
				hotkey={getHotkeyLabel("connector")}
				isOn={isAddConnectorOn}
				tipOnLeft
			>
				<Icon
					name="Connector"
					width={24}
					height={24}
					fill="rgb(0,0,0)"
				/>
			</UiButton>
			<div
				id="AddConnectorMenu"
				className="ToolsPanelMenu"
				style={{
					// width: "52px",
					paddingLeft: "0px",
					paddingRight: "0px",
					visibility: isOn ? "visible" : "hidden",
					marginTop: "-80px",
				}}
			>
				<ConnectorLineStylePicker onPick={handlePickLineStyle} />
			</div>
		</div>
	);
}
