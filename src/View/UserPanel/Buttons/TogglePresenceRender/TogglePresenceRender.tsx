import clsx from "clsx";
import React, { useState } from "react";
import styles from "./TogglePresenceRender.module.css";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import { useTranslation } from "react-i18next";

export const TogglePresenceRender: React.FC = () => {
	const { t } = useTranslation();
	const [cursorsActive, setCursorsActive] = useState(true);
	const { app } = useAppContext();

	return (
		<UiButton
			id={"tool-cursors-toggle"}
			tooltipPosition="bottom"
			tooltip={
				cursorsActive
					? t("presence.hideCursors")
					: t("presence.showCursors")
			}
			className={clsx(styles.icon, cursorsActive && styles.iconActive)}
			active={cursorsActive}
			variant="secondary"
			rounded="none"
			onClick={() => {
				const cursorsEnabled = app
					.getBoard()
					.presence.toggleCursorsRendering();

				setCursorsActive(cursorsEnabled);
			}}
		>
			<Icon iconName="ToggleCursors" width={20} height={20} />
		</UiButton>
	);
};
