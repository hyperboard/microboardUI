import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { Icon } from "shared/ui-lib/Icon";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { ListType } from "microboard-temp";

const MENU_NAME = "AddList";

export function AddList(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const richText = board.selection.items.getSingle()?.getRichText();
  if (!richText) {
    return null;
  }

  const listType = richText.editor.getListTypeAtSelectionStart();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handleListTypePick = (listType: ListType): void => {
    richText.editor.toggleListType(listType);
    toggleMenu(MENU_NAME);
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
          id="addListBtn"
          tooltip={t("contextPanel.addList.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="none"
        >
          <Icon width={18} height={18} iconName="BulletedList" />
        </UiButton>
      }
    >
      <UiPanel rounded="bottom" vertical={false} padding={12} gap={8}>
        <UiButton
          className={btnStyle.contextPanelButton}
          id={"addList-ul"}
          onClick={() => handleListTypePick("ul_list")}
          variant="secondary"
          rounded="full"
          active={listType === "ul_list"}
        >
          <Icon iconName="BulletedList" width={20} height={20} />
        </UiButton>
        <UiButton
          className={btnStyle.contextPanelButton}
          id={"addList-ol"}
          onClick={() => handleListTypePick("ol_list")}
          variant="secondary"
          rounded="full"
          active={listType === "ol_list"}
        >
          <Icon iconName="NumberedList" width={20} height={20} />
        </UiButton>
      </UiPanel>
    </ButtonWithMenu>
  );
}
