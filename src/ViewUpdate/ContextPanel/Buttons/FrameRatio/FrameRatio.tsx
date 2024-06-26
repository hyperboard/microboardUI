import { Frame } from "Board/Items";
import { FrameType } from "Board/Items/Frame/Basic";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { FrameIcon, Icon } from "ViewUpdate/Icon";
import { FramePicker } from "ViewUpdate/Pickers/FramePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import style from "./FrameRatio.module.css";

const MENU_NAME = "FrameType";

export function FrameRatio(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const item = board.selection.items.getSingle();
	const frame = item instanceof Frame ? item : null;

	const handlePick = (type: FrameType) => {
		if (frame) {
			frame.setFrameType(type);
		}
		toggleMenu("None");
	};
	const handlePointerEnter = (type: FrameType) => {
		if (frame) {
			frame.setNewShape(type);
		}
	};
	const handlePointerLeave = () => {
		if (frame) {
			frame.setNewShape(null);
		}
	};

	const selectedShapes = board.selection.list();
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={verticalAlign => (
				<UiButton
					id="item-type"
					tooltip={t("contextPanel.changeFrameType.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="left"
					className={clsx(
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuOpened,
					)}
				>
					{selectedShapes.length > 1 ? (
						<Icon iconName="Shape" />
					) : (
						<FrameIcon iconName={frame?.getFrameType()} />
					)}
				</UiButton>
			)}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
					grid
					columns={3}
					gap={4}
				>
					<FramePicker
						selected={frame?.getFrameType()}
						onPick={handlePick}
						onPointerEnter={handlePointerEnter}
						onPointerLeave={handlePointerLeave}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
