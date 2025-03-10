import React from "react";
import { useAppContext } from "features/AppContext";
import { RestOptionsMenuItem } from "./RestOptionsMenu/RestOptionsMenuItem";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { getHotkeyLabel } from "Board/Keyboard";
import styles from "./ContextPanelButton.module.css";
import clsx from "clsx";

export function FrameNavPrev(): JSX.Element {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleFrameNavPrev = (): void => {
		board.tools.frameNavigation("prev");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleFrameNavPrev}
			icon={
				<Icon
					width={15}
					height={20}
					iconName="ArrowRightFill"
					className={clsx(
						styles.frameNavIcon,
						styles.frameNavIconPrev,
					)}
				/>
			}
			hotkey={getHotkeyLabel("frameNavigationPrev")}
		>
			{t("contextPanel.frameNavigation.prev")}
		</RestOptionsMenuItem>
	);
}
