import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { UiPanel } from "View/Ui/UiPanel";
import styles from "./ShapesPanel.module.css";
import { useShapesPanelContext } from "./ShapesPanelContext";
import { ShapeType } from "../../Board/Items/Shape";
import { ShapeCategoryName, SHAPES_CATEGORIES } from "../Tools/AddShape";
import { UiButton } from "../Ui/UiButton";
import { Icon } from "../Icon";
import { ShapesCategory } from "./ShapesCategory/ShapesCategory";

export function ShapesPanel(): JSX.Element {
	const [isShapeSelected, setIsShapeSelected] = useState(false);
	const { isOpen, closeShapesPanel } = useShapesPanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const addShape = board.tools.getAddShape();
	const isDown = addShape?.isDown;

	useEffect(() => {
		if (isDown) {
			setIsShapeSelected(true);
		}
	}, [isDown]);

	const handlePick = (
		shape: ShapeType,
		category?: ShapeCategoryName,
		e?: MouseEvent,
	) => {
		if (!board.tools.getAddShape()) {
			board.tools.addShape(true);
		}
		const tool = board.tools.getAddShape();
		if (e && e.detail === 2) {
			return tool?.createShapeInCenter(shape);
		}
		if (tool) {
			tool.setShapeType(shape);
			setIsShapeSelected(true);
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
			{SHAPES_CATEGORIES.map(category => {
				return (
					<ShapesCategory
						categoryName={category.name}
						handlePick={handlePick}
						key={category.name}
					/>
				);
			})}
		</UiPanel>
	);
}
