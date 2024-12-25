import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import style from "./RestOptionsMenu.module.css";
import btnStyle from "../ContextPanelButton.module.css";

const MENU_NAME = "RestOptions";

type Props = PropsWithChildren<{
	rounded?: "left" | "right" | "none" | "full";
}>;

function getRounded(
	verticalAlign: string,
	horizontalAlign: string,
	isOptionsInTop: boolean,
): "full" | "bottom" | "topRightBottom" | "bottomRightTop" | "top" | undefined {
	if (verticalAlign === "bottom") {
		if (horizontalAlign === "None") {
			return "topRightBottom";
		}
		if (horizontalAlign === "Center") {
			return "bottom";
		}
	}
	
	if (isOptionsInTop) {
		if (horizontalAlign === "None") {
			return "bottomRightTop";
		}
		if (horizontalAlign === "Center") {
			return "top";
		}
	}
	
	return "full";
}

export function RestOptionsMenu({
	rounded = "right",
	children,
}: Props): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight, windowWidth } =
		usePanelContext();

	const handleClick = (): void => toggleMenu(MENU_NAME);
	const isOptionsInTop = panelMbr.top < windowHeight;

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			windowWidth={windowWidth}
			openedMenu={openedMenu}
			menuName={MENU_NAME}
			align="left"
			button={verticalAlign => (
				<UiButton
					id={"options-menu"}
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded={rounded}
					className={clsx(
						btnStyle.contextPanelButton,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuBottom,
					)}
				>
					<Icon iconName="Dots" />
				</UiButton>
			)}
		>
			{(verticalAlign, horizontalAlign) => (
				<UiPanel
					rounded={getRounded(
						verticalAlign,
						horizontalAlign,
						isOptionsInTop,
					)}
					vertical
					className={style.menu}
					padding={6}
				>
					{children}
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
