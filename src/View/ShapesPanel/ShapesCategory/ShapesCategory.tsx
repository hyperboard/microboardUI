import React, { useState } from "react";
import styles from "./ShapesCategory.module.css";
import { ShapePicker } from "../../Pickers/ShapeTypePicker";
import { useTranslation } from "react-i18next";
import { ShapeType } from "../../../Board/Items/Shape";
import { ShapeCategoryName } from "../../Tools/AddShape";
import { Icon } from "../../Icon";
import { UiButton } from "../../Ui/UiButton";
import clsx from "clsx";

interface Props {
	handlePick: (
		shape: ShapeType,
		category?: ShapeCategoryName,
		e?: MouseEvent,
	) => void;
	categoryName: ShapeCategoryName;
}

export const ShapesCategory = ({ handlePick, categoryName }: Props) => {
	const [isPickerShown, setIsPickerShown] = useState(true);
	const { t } = useTranslation();

	return (
		<div>
			<div className={styles.categoryHeader}>
				<p className={styles.categoryName}>
					{t(`shapesPanel.${categoryName}`)}
				</p>
				<UiButton
					onClick={() => setIsPickerShown(!isPickerShown)}
					variant="secondary"
					size={"sm"}
				>
					<Icon
						iconName={isPickerShown ? "Minus" : "Plus"}
						width={16}
						height={16}
					/>
				</UiButton>
			</div>
			<div
				className={clsx(
					styles.shapesGrid,
					!isPickerShown && styles.closed,
				)}
			>
				<ShapePicker
					withTooltips={true}
					categoryName={categoryName}
					onPick={handlePick}
					buttonSize="lg"
				/>
			</div>
		</div>
	);
};
