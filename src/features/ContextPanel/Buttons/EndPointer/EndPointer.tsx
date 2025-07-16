import { ConnectorPointerStyle } from "microboard-temp";
import clsx from "clsx";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { ConnectorPointerPicker } from "features/Pickers/ConnectorPointerPicker/ConnectorPointerPicker";
import React from "react";
import { useTranslation } from "react-i18next";
import { ConnectorPointerIcon } from "shared/ui-lib/Icon";
import { ConnectorPointerType } from "shared/ui-lib/Icon/ConnectorPointerIcon";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "../ContextPanelButton.module.css";
import style from "./EndPointer.module.css";

const MENU_NAME = "EndPointer";

export function EndPointer(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board, app } = useAppContext();
  const { t } = useTranslation();
  const pointerStartStyle = board.selection.getEndPointerStyle();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };
  const handlePick = (type: ConnectorPointerStyle): void => {
    board.selection.setEndPointerStyle(type);
    app.sessionStorage.setConnectorPointer(type, "end");
    toggleMenu("None");
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
          id={"end-pointer"}
          tooltip={t("contextPanel.connectorEndPointer.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          rounded="none"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          className={clsx(style.button, btnStyle.contextPanelButton)}
        >
          {/* {pointerStartStyle === "None" ? (
						t("contextPanel.connectorPointerNone")
					) : (
						<ConnectorPointerIcon
							iconName={pointerStartStyle as ConnectorPointerType}
						/>
					)} */}
          <ConnectorPointerIcon
            iconName={pointerStartStyle as ConnectorPointerType}
          />
        </UiButton>
      }
    >
      {(verticalAlign) => (
        <UiPanel grid padding={0} columns={2} className={style[verticalAlign]}>
          <ConnectorPointerPicker
            selected={pointerStartStyle}
            onPick={handlePick}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
