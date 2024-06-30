import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import style from "./RestOptionsMenu.module.css";

const MENU_NAME = "RestOptions";

type Props = PropsWithChildren<{
	rounded?: "left" | "right" | "none" | "full";
}>;

export function RestOptionsMenu({
	rounded = "right",
	children,
}: Props): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const handleClick = () => toggleMenu(MENU_NAME);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
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
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuBottom,
					)}
				>
					<Icon iconName="Dots" />
				</UiButton>
			)}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
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
