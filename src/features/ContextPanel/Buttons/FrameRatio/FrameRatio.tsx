import { Frame } from "Board/Items";
import { FrameType } from "Board/Items/Frame/Basic";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { Icon } from "shared/ui-lib/Icon";
import { FramePicker } from "features/Pickers/FramePicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import style from "./FrameRatio.module.css";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import i18n from "shared/Lang";

const MENU_NAME = "FrameType";

const frameTypeTitle: Record<FrameType, string> = {
	A4: "A4",
	Letter: "Letter",
	Frame16x9: "16 : 9",
	Frame4x3: "4 : 3",
	Frame1x1: "1 : 1",
	Custom: i18n.t("frame.custom"),
	Frame3x2: "3 : 2",
	Frame9x18: "9 : 18",
};

export function FrameRatio(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const frameType = board.selection.getFrameType();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (type: FrameType): void => {
		board.selection.setFrameType(type);
		toggleMenu("None");
	};
	const selectedFrames = board.selection.list() as Frame[];
	const handlePointerEnter = (type: FrameType): void => {
		selectedFrames.forEach(frame => {
			frame.setNewShape(type);
		});
	};
	const handlePointerLeave = (): void => {
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
					hideTooltip={openedMenu === MENU_NAME}
					rounded="left"
					className={clsx(
						btnStyle.contextPanelButton,
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
					columns={4}
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
