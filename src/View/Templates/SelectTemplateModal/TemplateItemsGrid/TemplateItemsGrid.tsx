import React from "react";
import styles from "./TemplateItemsGrid.module.css";
import { TemplateItem } from "./TemplateItem/TemplateItem";
import clsx from "clsx";
import { Template } from "../../../Tools/Template";

interface TemplateItemsGridProps {
	templates: Template[];
	setIsOpen: (isOpen: boolean) => void;
	setPresentedTemplate: (template: null | Template) => void;
	className?: string;
}

export const TemplateItemsGrid = ({
	templates,
	setPresentedTemplate,
	setIsOpen,
	className,
}: TemplateItemsGridProps) => {
	return (
		<div className={clsx(styles.templatesGrid, className)}>
			{templates.map(template => (
				<TemplateItem
					key={template.uniq_id}
					setIsOpen={setIsOpen}
					template={template}
					setPresentedTemplate={setPresentedTemplate}
				/>
			))}
		</div>
	);
};
