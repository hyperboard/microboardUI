import { Icon, TextColorIndicator } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import React, { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { useAIContext } from "View/AIInput/AIContext";
import { Dropdown } from "View/AIInput";
import { useAccount } from "App/useAccount";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu/ButtonWithMenu";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { usePanelContext } from "View/ContextPanel/PanelContext";

type Props = {
	rounded?: "left" | "right" | "none" | "full";
};

const MENU_NAME = "AIModelSelector";

export function AIModel({ rounded = "none" }: Props): React.ReactElement {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTranslation();
	const account = useAccount();
	const { model } = useAIContext();

	const handleClick = async (ev: SyntheticEvent): Promise<void> => {
		toggleMenu("AIModelSelector");
	};

	const closeMenu = () => {
		if (openedMenu === "AIModelSelector") {
			toggleMenu("AIModelSelector");
		}
	};

	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					className={btnStyle.contextPanelButton}
					id="SelectAiModel"
					tooltip={t("contextPanel.textColor.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					{t(`ai.models.${model}.mobileTitle`)}
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
				>
					<Dropdown
						isRelativePosition={true}
						isPhoneScreen={true}
						setIsDropdownOpen={closeMenu}
						account={account}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
