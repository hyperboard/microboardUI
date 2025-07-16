import { ShapeCategoryName, Shape, ShapeType } from "microboard-temp";
import clsx from "clsx";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { ShapePicker } from "features/Pickers/ShapeTypePicker";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon, ShapeIcon } from "shared/ui-lib/Icon";
import { UiAccordion } from "shared/ui-lib/UiAccordion";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "../ContextPanelButton.module.css";
import style from "./ItemType.module.css";

const MENU_NAME = "ItemType";

const getCategoryName = (shapeType: ShapeType): ShapeCategoryName => {
  const separated = shapeType.split("_");
  if (separated.length === 1) {
    return "basicShapes";
  }
  return separated[0] as ShapeCategoryName;
};

export function ItemType(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };
  const handlePick = (type: ShapeType): void => {
    board.selection.setShapeType(type);
    toggleMenu("None");
  };

  const selectedShapes = board.selection
    .list()
    .filter((i) => i.itemType === "Shape") as Shape[];

  const shapeCategory = getCategoryName(selectedShapes[0].getShapeType());

  return (
    <ButtonWithMenu
      menuName={MENU_NAME}
      openedMenu={openedMenu}
      panelMbr={panelMbr}
      windowHeight={windowHeight}
      align="left"
      button={(verticalAlign) => (
        <UiButton
          id="item-type"
          tooltip={t("contextPanel.changeShape.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="left"
          className={clsx(
            btnStyle.contextPanelButton,
            verticalAlign === "bottom" &&
              openedMenu === MENU_NAME &&
              style.menuBottom,
          )}
        >
          {selectedShapes.length > 1 ? (
            <Icon iconName="Shape" />
          ) : (
            <ShapeIcon iconName={selectedShapes[0].getShapeType()} />
          )}
        </UiButton>
      )}
    >
      {(verticalAlign) => (
        <UiPanel rounded={verticalAlign === "bottom" ? "bottom" : "full"}>
          <UiAccordion
            className={style.wrapper}
            contentClassName={style.panel}
            closedHeight={128}
            openedHeight={300}
            renderButton={(toggle, isOpen) => (
              <UiButton onClick={toggle} variant="tertiary" size="sm">
                {isOpen
                  ? t("toolsPanel.addShape.showBasic")
                  : t("toolsPanel.addShape.showAll")}
              </UiButton>
            )}
          >
            <ShapePicker
              categoryName={shapeCategory}
              selected={
                selectedShapes.length === 1
                  ? selectedShapes[0].getShapeType()
                  : "None"
              }
              onPick={handlePick}
            />
          </UiAccordion>
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
