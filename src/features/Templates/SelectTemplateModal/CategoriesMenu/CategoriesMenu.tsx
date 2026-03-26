import React from "react";
import styles from "./CategoriesMenu.module.css";
import clsx from "clsx";
import { Icon } from "../../../../shared/ui-lib/Icon";
import { IconId } from "../../../../shared/ui-lib/Icon/Icon";
import {
  TemplateCategory,
  TEMPLATE_CATEGORIES,
  CATEGORY_ICONS,
} from "../../constants";
import { useTranslation } from "react-i18next";

interface CategoriesMenuProps {
  setSelectedCategory: (item: TemplateCategory) => void;
  selectedCategory: TemplateCategory;
}

const USE_CASE_CATEGORIES: { iconName: IconId; value: TemplateCategory }[] = [
  {
    iconName: CATEGORY_ICONS["All templates"] as IconId,
    value: "All templates",
  },
  ...TEMPLATE_CATEGORIES.map((category) => ({
    iconName: CATEGORY_ICONS[category] as IconId,
    value: category,
  })),
];

export const CategoriesMenu = ({
  setSelectedCategory,
  selectedCategory,
}: CategoriesMenuProps) => {
  const { t } = useTranslation();

  return (
    <nav className={styles.navigation}>
      <ul className={styles.categoryList}>
        {USE_CASE_CATEGORIES.map((item) => {
          return (
            <li
              onClick={() => setSelectedCategory(item.value)}
              key={item.value}
              className={clsx(
                styles.categoryItem,
                selectedCategory === item.value && styles.activeCategoryItem,
              )}
            >
              <Icon width={20} height={20} iconName={item.iconName} />
              <p>{t(`modalTemplate.category.useCaseItems.${item.value}`)}</p>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
