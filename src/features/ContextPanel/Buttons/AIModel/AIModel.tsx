import { useAccount } from "App/useAccount";
import { Dropdown } from "entities/AIInput";
import { useAIContext } from "entities/AIInput/AIContext";
import React from "react";
import { useTranslation } from "react-i18next";
import btnStyle from "../ContextPanelButton.module.css";
import clsx from "clsx";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { UiButton } from "shared/ui-lib/UiButton";
import { ButtonWithMenu } from "../ButtonWithMenu";
import style from "./AIModel.module.css";
import { UiPanel } from "shared/ui-lib/UiPanel";

type Props = {
  rounded?: "left" | "right" | "none" | "full";
};

const MENU_NAME = "AIModelSelector";

export function AIModel({ rounded = "none" }: Props): React.ReactElement {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { t } = useTranslation();
  const translate = (key: string): string => t(key as never);
  const account = useAccount();
  const { model } = useAIContext();

  const handleClick = () => {
    toggleMenu(MENU_NAME);
  };

  const closeMenu = () => {
    if (openedMenu === MENU_NAME) {
      toggleMenu(MENU_NAME);
    }
  };

  return (
    // <div>
    // 	<UiButton
    // 		className={clsx(btnStyle.contextPanelButton, btnStyle.bold)}
    // 		id="SelectAiModel"
    // 		tooltip={t("contextPanel.ai.model")}
    // 		tooltipPosition="top"
    // 		onClick={handleClick}
    // 		variant="secondary"
    // 		active={openedMenu === MENU_NAME}
    // 		rounded={rounded}
    // 	>
    // 		{t(`ai.models.${model}.mobileTitle`)}
    // 	</UiButton>
    // 	{openedMenu === MENU_NAME && (
    // 		<Dropdown
    // 			isPhoneScreen={true}
    // 			setIsDropdownOpen={closeMenu}
    // 			account={account}
    // 		/>
    // 	)}
    // </div>
    <ButtonWithMenu
      menuName={MENU_NAME}
      openedMenu={openedMenu}
      panelMbr={panelMbr}
      windowHeight={windowHeight}
      align="left"
      button={(verticalAlign) => (
        <UiButton
          className={clsx(btnStyle.contextPanelButton, btnStyle.bold)}
          id="SelectAiModel"
          tooltip={t("contextPanel.ai.model")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded={rounded}
        >
          {translate(`ai.models.${model}.mobileTitle`)}
        </UiButton>
      )}
    >
      {(verticalAlign) => (
        <UiPanel
          rounded={verticalAlign === "bottom" ? "bottom" : "full"}
          className={style.menu}
          padding={0}
        >
          <Dropdown setIsDropdownOpen={closeMenu} account={account} />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
