import React from "react";
import styles from "./templateItem.module.css";
import { Template } from "../types";

interface TemplateItemProps {
	preview: string;
	name: string;
	setPresentedTemplate: (template: null | Template) => void;
}

export const TemplateItem = ({
	preview,
	name,
	setPresentedTemplate,
}: TemplateItemProps) => {
	return (
		<div className={styles.card}>
			<img
				onClick={setPresentedTemplate}
				className={styles.image}
				src={preview}
				alt="template preview"
			/>
			<p>{name}</p>
		</div>
	);
};
