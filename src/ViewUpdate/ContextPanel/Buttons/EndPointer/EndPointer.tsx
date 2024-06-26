import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { ConnectorPointerIcon } from "ViewUpdate/Icon";
import { ConnectorPointerPicker } from "ViewUpdate/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./EndPointer.module.css";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "EndPointer";

export function EndPointer(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
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
			offset={false}
			button={
				<UiButton
					id={"start-pointer"}
					tooltip={t("contextPanel.connectorEndPointer.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="none"
					active={openedMenu === MENU_NAME}
					className={style.button}
				>
					{pointerStartStyle === "None" ? (
						"None"
					) : (
						<ConnectorPointerIcon iconName={pointerStartStyle} />
					)}
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					grid
					padding={0}
					columns={2}
					className={style[verticalAlign]}
				>
					<ConnectorPointerPicker
						selected={pointerStartStyle}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
