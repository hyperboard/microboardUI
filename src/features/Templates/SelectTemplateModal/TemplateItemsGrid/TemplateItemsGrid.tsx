import React from "react";
import styles from "./TemplateItemsGrid.module.css";
import { TemplateItem } from "./TemplateItem/TemplateItem";
import clsx from "clsx";
import { Template } from "microboard-temp";

interface TemplateItemsGridProps {
  templates: Template[];
  setPresentedTemplate: (template: null | Template) => void;
  className?: string;
}

export const TemplateItemsGrid = ({
  templates,
  setPresentedTemplate,
  className,
}: TemplateItemsGridProps) => {
  const getPlaceHolders = () => {
    if (templates.length < 3 && templates.length > 0) {
      return Array(3)
        .fill(3 - templates.length)
        .map((_, index) => <div key={index}></div>);
    }
    return [];
  };

  return (
    <div className={clsx(styles.templatesGrid, className)}>
      {templates.map((template) => (
        <TemplateItem
          key={template.uniqId}
          template={template}
          setPresentedTemplate={setPresentedTemplate}
        />
      ))}
      {getPlaceHolders()}
    </div>
  );
};
