import { ShapeType } from "Board/Items/Shape";
import React from "react";
import { ShapeIcon } from "View/Icon";
import { ShapeCategoryName, SHAPES_CATEGORIES } from "View/Tools/AddShape";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { useTranslation } from "react-i18next";

type Props = {
	onPick: (type: ShapeType, category?: ShapeCategoryName) => void;
	selected?: ShapeType | "None";
	categoryName: ShapeCategoryName;
	buttonSize?: "lg" | "md" | "sm";
	withTooltips?: boolean;
};

export function ShapePicker({
	onPick,
	selected,
	categoryName,
	buttonSize = "md",
	withTooltips = false,
}: Props): React.ReactElement {
	const { t } = useTranslation();

	const shapes = SHAPES_CATEGORIES.find(
		category => category.name === categoryName,
	)!.shapes;

	let currentTooltipPosition = "top-left";
	let currentTooltipPositionCount = 1;
	const getTooltipPosition = () => {
		const position = currentTooltipPosition;
		if (position === "top") {
			currentTooltipPosition = "top-right";
			currentTooltipPositionCount = 1;
			return position;
		}
		currentTooltipPositionCount += 1;
		if (position === "top-left" && currentTooltipPositionCount > 2) {
			currentTooltipPosition = "top";
			currentTooltipPositionCount = 1;
		} else if (
			position === "top-right" &&
			currentTooltipPositionCount > 2
		) {
			currentTooltipPosition = "top-left";
			currentTooltipPositionCount = 1;
		}
		return position;
	};

	return (
		<>
			{shapes.map((shape, index) => (
				<UiButton
					tooltipPosition={
						withTooltips ? getTooltipPosition() : undefined
					}
					tooltip={
						categoryName !== "basicShapes" && withTooltips
							? t(`shapePicker.${categoryName}.${shape}`)
							: undefined
					}
					id={`shape-${shape}`}
					onClick={() => onPick(shape, categoryName)}
					key={shape}
					size={buttonSize}
					variant="secondary"
					active={selected === shape}
				>
					<ShapeIcon iconName={shape} width={24} height={24} />
				</UiButton>
			))}
		</>
	);
}
