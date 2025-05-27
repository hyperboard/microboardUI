import React, { useState } from "react";
import styles from "../BoardMenu.module.css";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { ButtonWithMenu } from "features/ToolsPanel/Buttons/ButtonWithMenu/ButtonWithMenu";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { useForceUpdate } from "shared/lib/useForceUpdate";

export const MouseOrTrackpad = () => {
	const [isSetControlModeOpen, setIsSetControlModeOpen] = useState(false);
	const { app } = useAppContext();
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();

	const setControlMode = (mode: "auto" | "mouse" | "trackpad") => {
		app.setControlMode(mode);
		forceUpdate();
	};

	const getIsActive = (mode: "mouse" | "trackpad" | "auto"): boolean => {
		return app.getSettings().controlMode === mode;
	};

	return (
		<ButtonWithMenu
			className={styles.buttonWithMenu}
			isOpen={isSetControlModeOpen}
			button={
				<button
					onClick={() =>
						setIsSetControlModeOpen(!isSetControlModeOpen)
					}
					className={styles.btn}
				>
					<div className={styles.buttonContainer}>
						<Icon
							iconName="MouseOrTrackpad"
							width={20}
							height={20}
						/>
						{t("boardMenu.controlMode.tooltip")}
					</div>
				</button>
			}
		>
			<UiPanel
				rounded={"full"}
				style={{ padding: "4px", gap: "2px" }}
				grid
				vertical
			>
				<button
					onClick={() => setControlMode("mouse")}
					className={styles.btn}
				>
					<div className={styles.buttonContainer}>
						<Icon iconName="Mouse" width={20} height={20} />
						{t("boardMenu.controlMode.mouse")}
					</div>
					{getIsActive("mouse") && (
						<Icon iconName="checkMark" width={16} height={16} />
					)}
				</button>
				<button
					onClick={() => setControlMode("trackpad")}
					className={styles.btn}
				>
					<div className={styles.buttonContainer}>
						<Icon iconName="Trackpad" width={20} height={20} />
						{t("boardMenu.controlMode.trackpad")}
					</div>
					{getIsActive("trackpad") && (
						<Icon iconName="checkMark" width={16} height={16} />
					)}
				</button>
				<button
					onClick={() => setControlMode("auto")}
					className={styles.btn}
				>
					<div className={styles.buttonContainer}>
						<Icon iconName="Auto" width={20} height={20} />
						{t("boardMenu.controlMode.auto")}
					</div>
					{getIsActive("auto") && (
						<Icon iconName="checkMark" width={16} height={16} />
					)}
				</button>
			</UiPanel>
		</ButtonWithMenu>
	);
};
