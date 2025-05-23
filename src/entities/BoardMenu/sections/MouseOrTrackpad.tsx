import React, { useState } from "react";
import styles from "../BoardMenu.module.css";
import { Button } from "shared/ui-lib/Button/Button";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { ToggleMark } from "shared/ui-lib/ToggleMark/ToggleMark";
import { ButtonWithMenu } from "features/ToolsPanel/Buttons/ButtonWithMenu/ButtonWithMenu";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";

export const MouseOrTrackpad = () => {
	const [isSetControlModeOpen, setIsSetControlModeOpen] = useState(false);
	const { app } = useAppContext();
	const { t } = useTranslation();

	const setControlMode = (mode: "auto" | "mouse" | "trackpad") => {
		app.setControlMode(mode);
		setIsSetControlModeOpen(false);
	};
	return (
		<ButtonWithMenu
			className={styles.buttonWithMenu}
			isOpen={isSetControlModeOpen}
			button={
				<Button
					onClick={() =>
						setIsSetControlModeOpen(!isSetControlModeOpen)
					}
					className={styles.btn}
					pattern="tertiary"
				>
					{t("boardMenu.controlMode.tooltip")}
				</Button>
			}
		>
			<UiPanel rounded={"full"} gap={8} grid vertical>
				<Button
					onClick={() => setControlMode("mouse")}
					className={styles.btn}
					pattern="tertiary"
				>
					<div className={styles.buttonContainer}>
						<Icon iconName="Mouse" width={16} height={16} />
						{t("boardMenu.controlMode.mouse")}
					</div>
					<ToggleMark
						isActive={app.getSettings().controlMode === "mouse"}
					/>
				</Button>
				<Button
					onClick={() => setControlMode("trackpad")}
					className={styles.btn}
					pattern="tertiary"
				>
					<div className={styles.buttonContainer}>
						<Icon iconName="Trackpad" width={16} height={16} />
						{t("boardMenu.controlMode.trackpad")}
					</div>
					<ToggleMark
						isActive={app.getSettings().controlMode === "trackpad"}
					/>
				</Button>
				<Button
					onClick={() => setControlMode("auto")}
					className={styles.btn}
					pattern="tertiary"
				>
					<div className={styles.buttonContainer}>
						<Icon iconName="Auto" width={16} height={16} />
						{t("boardMenu.controlMode.auto")}
					</div>
					<ToggleMark
						isActive={app.getSettings().controlMode === "auto"}
					/>
				</Button>
			</UiPanel>
		</ButtonWithMenu>
	);
};
