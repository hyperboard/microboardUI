import React, { useState } from "react";
import styles from "./ShapesCategory.module.css";
import { ShapePicker } from "../../Pickers/ShapeTypePicker";
import { useTranslation } from "react-i18next";
import { ShapeType } from "../../../Board/Items/Shape";
import { ShapeCategoryName } from "../../Tools/AddShape";
import { Icon } from "../../Icon";
import { UiButton } from "../../Ui/UiButton";
import clsx from "clsx";
import { useAppContext } from "View/AppContext";
import { useForceUpdate } from "lib/useForceUpdate";
import { useAppSubscription } from "Board/useBoardSubscription";

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
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["tools"],
		observer: forceUpdate,
	});
	const { t } = useTranslation();

	return (
		<div className={styles.categoryContainer}>
			<div className={styles.categoryHeader}>
				<p className={styles.categoryName}>
					{t(`shapesPanel.${categoryName}`)}
				</p>
				<UiButton
					onClick={() => setIsPickerShown(!isPickerShown)}
					variant="secondary"
					size={"sm"}
					style={{ minWidth: "unset" }}
				>
					<Icon
						iconName={
							isPickerShown
								? "StrokeChevronUp"
								: "StrokeChevronDown"
						}
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
					categoryName={categoryName}
					onPick={handlePick}
					buttonSize="lg"
					selected={board.tools.getAddShape()?.type}
				/>
			</div>
		</div>
	);
};
