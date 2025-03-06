import { UiButton } from "View/Ui/UiButton/UiButton";
import React, { SyntheticEvent, useRef } from "react";
import { useTranslation } from "react-i18next";
import btnStyle from "./ContextPanelButton.module.css";
import { useAIContext } from "View/AIInput/AIContext";
import { Dropdown } from "View/AIInput";
import { useAccount } from "App/useAccount";

import { usePanelContext } from "View/ContextPanel/PanelContext";
import clsx from "clsx";

type Props = {
	rounded?: "left" | "right" | "none" | "full";
};

const MENU_NAME = "AIModelSelector";

export function AIModel({ rounded = "none" }: Props): React.ReactElement {
	const { toggleMenu, openedMenu } = usePanelContext();
	const { t } = useTranslation();
	const account = useAccount();
	const { model } = useAIContext();
	const containerRef = useRef<HTMLDivElement | null>(null);

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const closeMenu = () => {
		if (openedMenu === MENU_NAME) {
			toggleMenu(MENU_NAME);
		}
	};

	return (
		<div ref={containerRef}>
			<UiButton
				className={clsx(btnStyle.contextPanelButton, btnStyle.bold)}
				id="SelectAiModel"
				tooltip={t("contextPanel.ai.model")}
				tooltipPosition="top"
				onClick={handleClick}
				variant="secondary"
				active={openedMenu === MENU_NAME}
				rounded={rounded}
			>
				{t(`ai.models.${model}.mobileTitle`)}
			</UiButton>
			{openedMenu === MENU_NAME && (
				<div style={{ width: "100%", position: "relative" }}>
					<Dropdown
						isRelativePosition={true}
						isPhoneScreen={true}
						setIsDropdownOpen={closeMenu}
						account={account}
						relativeBlockRef={
							containerRef ? containerRef : undefined
						}
					/>
				</div>
			)}
		</div>
	);
}
