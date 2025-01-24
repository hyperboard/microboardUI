import React from "react";
import { useAppContext } from "View/AppContext";
import { RestOptionsMenuItem } from "./RestOptionsMenu/RestOptionsMenuItem";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { getHotkeyLabel } from "Board/Keyboard";
import styles from './ContextPanelButton.module.css'

export function FrameNavNext(): JSX.Element {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleFrameNavNext = (): void => {
		board.tools.frameNavigation("next");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleFrameNavNext}
			icon={
				<Icon
					width={15}
					height={20}
					iconName="ArrowRightFill"
					className={styles.frameNavIcon}
				/>
			}
			hotkey={getHotkeyLabel("frameNavigationNext")}
		>
			{t("contextPanel.frameNavigation.next")}
		</RestOptionsMenuItem>
	);
}
