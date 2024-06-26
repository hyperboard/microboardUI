import { ConnectorLineStyle } from "Board/Items/Connector";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { Icon } from "ViewUpdate/Icon";
import { ConnectorLineStylePicker } from "ViewUpdate/Pickers/ConnectorLineStylePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "ConnectorType";

export function ConnectorType(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { board } = useAppContext();
	const { t } = useTranslation();

	const connectorType = board.selection.getConnectorLineStyle();
	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ConnectorLineStyle) => {
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
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
				>
					<Icon
						iconName={
							connectorType === "curved"
								? "CurvedLine"
								: "DiagonalLine"
						}
					/>
				</UiButton>
			}
		>
			<UiPanel rounded="bottom" gap={2} padding={2} vertical>
				<ConnectorLineStylePicker
					onPick={handlePick}
					selected={connectorType}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
