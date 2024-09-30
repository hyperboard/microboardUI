import React from "react";
import styles from "./CategoriesMenu.module.css";
import clsx from "clsx";
import { Icon } from "../../../Icon";
import { IconId } from "../../../Icon/Icon";
import { TemplateCategory } from "../../types";

interface CategoriesMenuProps {
	setSelectedCategory: (item: TemplateCategory) => void;
	selectedCategory: TemplateCategory;
}

const USE_CASE_CATEGORIES: { iconName: IconId; value: TemplateCategory }[] = [
	{ iconName: "AllTemplates", value: "All templates" },
	{ iconName: "ResearchAnalysis", value: "Research & Analysis" },
	{ iconName: "Diagramming", value: "Diagramming" },
	{ iconName: "MeetingWorkshop", value: "Meeting & Workshop" },
	{ iconName: "StrategyPlanning", value: "Strategy & Planning" },
	{ iconName: "Brainstorming", value: "Brainstorming" },
	{ iconName: "AgileWorkflow", value: "Agile Workflow" },
	{ iconName: "IcebreakerGame", value: "Icebreaker & Game" },
	{ iconName: "Education", value: "Education" },
];

export const CategoriesMenu = ({
	setSelectedCategory,
	selectedCategory,
}: CategoriesMenuProps) => {
	return (
		<nav className={styles.navigation}>
			<h4 className={styles.categoryName}>Use cases</h4>
			<ul className={styles.categoryList}>
				{USE_CASE_CATEGORIES.map(item => {
					return (
						<li
							onClick={() => setSelectedCategory(item.value)}
							key={item.value}
							className={clsx(
								styles.categoryItem,
								selectedCategory === item.value &&
									styles.activeCategoryItem,
							)}
						>
							<Icon
								width={20}
								height={20}
								iconName={item.iconName}
							/>
							<p>{item.value}</p>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};
