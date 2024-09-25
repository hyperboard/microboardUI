import React from "react";
import styles from "./CategoriesMenu.module.css";
import clsx from "clsx";
import { Icon } from "../../../Icon";
import { IconId } from "../../../Icon/Icon";

interface CategoriesMenuProps {
	setSelectedCategory: (item: string) => void;
	selectedCategory: string;
}

export const CategoriesMenu = ({
	setSelectedCategory,
	selectedCategory,
}: CategoriesMenuProps) => {
	const USE_CASE_CATEGORIES: { iconName: IconId; value: string }[] = [
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

	return (
		<nav className={styles.navigation}>
			<h4 className={styles.categoryName}>Use cases</h4>
			<ul className={styles.categoryList}>
				{USE_CASE_CATEGORIES.map(item => {
					return (
						<li
							onClick={() => setSelectedCategory(item.value)}
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
