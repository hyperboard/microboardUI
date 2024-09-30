import React from "react";
import styles from "./TemplateItemsGrid.module.css";
import { TemplateItem } from "./TemplateItem/TemplateItem";
import { Template } from "../../types";
import clsx from "clsx";

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
					preview={template.preview}
					name={template.name}
					setIsOpen={setIsOpen}
					snapshot={template.snapshot}
					setPresentedTemplate={() => setPresentedTemplate(template)}
				/>
			))}
		</div>
	);
};
