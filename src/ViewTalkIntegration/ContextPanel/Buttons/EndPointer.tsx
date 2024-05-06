import React from "react";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { ConnectorPointerPicker } from "ViewTalkIntegration/Pickers/ConnectorPointerPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "EndPointer";

export function EndPointer(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const pointerStartStyle = board.selection.getEndPointerStyle();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: string) => {
		board.selection.setEndPointerStyle(type);
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
					tooltip={t("contextPanel.connectorEndPointer.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<Icon
						width={18}
						height={18}
						iconName={
							pointerStartStyle === "AngleTalk"
								? "PointerEnd"
								: pointerStartStyle === "TriangleFilled"
								? "PointerEndCompact"
								: "PointerStart"
						}
					/>
				</UiButton>
			}
		>
			<UiPanel>
				<ConnectorPointerPicker
					selected={pointerStartStyle}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
