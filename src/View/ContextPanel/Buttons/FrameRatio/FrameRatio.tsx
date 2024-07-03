import { Frame } from "Board/Items";
import { FrameType } from "Board/Items/Frame/Basic";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { FrameIcon, Icon } from "View/Icon";
import { FramePicker } from "View/Pickers/FramePicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import style from "./FrameRatio.module.css";

const MENU_NAME = "FrameType";

const frameTypeTitle: Record<FrameType, string> = {
	A4: "A4",
	Letter: "Letter",
	Frame16x9: "16 : 9",
	Frame4x3: "4 : 3",
	Frame1x1: "1 : 1",
	Custom: "Custom",
};

export function FrameRatio(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const frameType = board.selection.getFrameType();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (type: FrameType) => {
		board.selection.setFrameType(type);
		toggleMenu("None");
	};
	const selectedFrames = board.selection.list() as Frame[];
	const handlePointerEnter = (type: FrameType) => {
		selectedFrames.forEach(frame => {
			frame.setNewShape(type);
		});
	};
	const handlePointerLeave = () => {
		selectedFrames.forEach(frame => {
			frame.setNewShape(null);
		});
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
						style.button,
						{
							[style.word]:
								frameType === "Custom" ||
								frameType === "Letter",
						},
					)}
				>
					{selectedFrames.length > 1 ? (
						<Icon iconName="Frame" />
					) : (
						frameTypeTitle[frameType]
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
						selected={frameType}
						onPick={handlePick}
						onPointerEnter={handlePointerEnter}
						onPointerLeave={handlePointerLeave}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
