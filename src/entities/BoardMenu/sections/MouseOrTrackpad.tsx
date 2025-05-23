import React, { useState } from "react";
import styles from "../BoardMenu.module.css";
import { Button } from "shared/ui-lib/Button/Button";
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
					<Icon
						iconName={
							app.getSettings().controlMode === "mouse"
								? "CheckboxFilled"
								: "Checkbox"
						}
						width={16}
						height={16}
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
					<Icon
						iconName={
							app.getSettings().controlMode === "trackpad"
								? "CheckboxFilled"
								: "Checkbox"
						}
						width={16}
						height={16}
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
					<Icon
						iconName={
							app.getSettings().controlMode === "auto"
								? "CheckboxFilled"
								: "Checkbox"
						}
						width={16}
						height={16}
					/>
				</Button>
			</UiPanel>
		</ButtonWithMenu>
	);
};
