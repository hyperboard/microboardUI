import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { UiPanel } from "shared/ui-lib/UiPanel";
import styles from "./ShapesPanel.module.css";
import { useShapesPanelContext } from "./ShapesPanelContext";
import type { ShapeType } from "microboard-temp";
import { Icon } from "../../shared/ui-lib/Icon";
import { ShapesCategory } from "./ShapesCategory/ShapesCategory";
import { UiButton } from "shared/ui-lib/UiButton";
import { getShapeCategories, type ShapeFamilyName } from "./shapeMetadata";

export function ShapesPanel(): React.JSX.Element {
  const { isOpen, closeShapesPanel, setSelectedCategory } =
    useShapesPanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();
  const categories = getShapeCategories();

  const handlePick = (
    shape: ShapeType,
    category?: ShapeFamilyName,
    e?: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    if (!board.tools.getAddShape()) {
      board.tools.addShape(true);
    }
    setSelectedCategory(category ? category : "basicShapes");
    const tool = board.tools.getAddShape();
    if (e && e.detail === 2) {
      return tool?.createShapeInCenter(shape);
    }
    if (tool) {
      tool.setShapeType(shape);
    }
  };

  return (
    <UiPanel
      padding={0}
      className={clsx(styles.shapesPanel, isOpen && styles.open)}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{t("shapesPanel.title")}</h3>
        <UiButton
          onClick={closeShapesPanel}
          variant="secondary"
          className={styles.close}
        >
          <Icon iconName="Close" />
        </UiButton>
      </div>
      <div className={styles.scrollContainer}>
        {categories.map((category) => {
          return (
            <ShapesCategory
              categoryName={category.name}
              options={category.options}
              handlePick={handlePick}
              key={category.name}
            />
          );
        })}
      </div>
    </UiPanel>
  );
}
