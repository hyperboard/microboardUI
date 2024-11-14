import React, {ReactNode} from "react";
import styles from "./TemplateItemsGrid.module.css";
import { TemplateItem } from "./TemplateItem/TemplateItem";
import clsx from "clsx";
import { Template } from "../../../Tools/Template";

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
	let placeholders: ReactNode[] | undefined;

	if (templates.length < 3 && templates.length > 0) {
		placeholders = []
		for (let i = templates.length; i < 3; i++) {
			placeholders.push(<div key={i}></div>)
		}
	}

	return (
		<div className={clsx(styles.templatesGrid, className)}>
			{templates.map(template => (
				<TemplateItem
					key={template.uniqId}
					template={template}
					setPresentedTemplate={setPresentedTemplate}
				/>
			))}
			{placeholders && placeholders}
		</div>
	);
};
