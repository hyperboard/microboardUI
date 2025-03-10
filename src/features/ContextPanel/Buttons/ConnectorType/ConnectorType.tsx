import { ConnectorLineStyle } from "Board/Items/Connector";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { Icon } from "features/Icon";
import { ConnectorLineStylePicker } from "features/Pickers/ConnectorLineStylePicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ConnectionLineWidths } from "../../../../Board/Items/Connector/Connector";
import { STEP_STROKE_WIDTH } from "Board/Items/Shape/ShapeData";
import { SliderPicker } from "../../../Pickers/SliderPicker";
import { StrokeStylePicker } from "../../../Pickers/StrokeStylePicker";
import styles from "./ConnectorType.module.css";
import { BorderStyle } from "../../../../Board/Items/Path";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { ConnectorIcon } from "shared/ui-lib/Icon";

const MENU_NAME = "ConnectorType";

export function ConnectorType(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { board, app } = useAppContext();
	const { t } = useTranslation();

	const connectorType = board.selection.getConnectorLineStyle();
	const connectorLineWidth = board.selection.getConnectorLineWidth();
	const borderStyle = board.selection.getBorderStyle();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ConnectorLineStyle): void => {
		board.selection.setConnectorLineStyle(type);
		app.sessionStorage.setConnectorLineStyle(type);
		toggleMenu("None");
	};

	const handleStrokeStylePick = (style: BorderStyle): void => {
		board.selection.setStrokeStyle(style);
		app.sessionStorage.setConnectorStrokeStyle(style);
		toggleMenu("None");
	};

	const handleSliderChange = (width: number): void => {
		board.selection.setStrokeWidth(width);
		app.sessionStorage.setConnectorLineWidth(width);
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
					className={btnStyle.contextPanelButton}
					id={"connector-type"}
					tooltip={t("contextPanel.connectorType.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
				>
					<ConnectorIcon iconName={connectorType} />
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
					gap={8}
					grid
				>
					<SliderPicker
						value={connectorLineWidth}
						onPick={handleSliderChange}
						min={ConnectionLineWidths[0]}
						max={ConnectionLineWidths[7]}
						step={STEP_STROKE_WIDTH}
						showLabel
						id="connector-line-width"
					/>
					<div className={styles.panel}>
						<ConnectorLineStylePicker
							onPick={handlePick}
							selected={connectorType}
						/>
					</div>
					<div className={styles.panel}>
						<StrokeStylePicker
							stroke={borderStyle}
							onPick={handleStrokeStylePick}
						/>
					</div>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
