import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { ConnectorPointerIcon } from "ViewUpdate/Icon";
import { ConnectorPointerPicker } from "ViewUpdate/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./StartPointer.module.css";
import { useAppContext } from "ViewUpdate/AppContext";
import clsx from "clsx";

const MENU_NAME = "StartPointer";

export function StartPointer(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const pointerStartStyle = board.selection.getStartPointerStyle();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: string) => {
		board.selection.setStartPointerStyle(type);
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={verticalAlign => (
				<UiButton
					id={"start-pointer"}
					tooltip={t("contextPanel.connectorStartPointer.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					rounded="left"
					active={openedMenu === MENU_NAME}
					className={clsx(
						style.button,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuOpened,
					)}
				>
					{pointerStartStyle === "None" ? (
						"None"
					) : (
						<ConnectorPointerIcon iconName={pointerStartStyle} />
					)}
				</UiButton>
			)}
		>
			{verticalAlign => (
				<UiPanel
					grid
					gap={2}
					padding={2}
					columns={2}
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
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
