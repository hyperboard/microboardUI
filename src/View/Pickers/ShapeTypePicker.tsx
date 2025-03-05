import { ShapeType } from "Board/Items/Shape";
import React, { CSSProperties, useRef, useState } from "react";
import { ShapeIcon } from "View/Icon";
import {
	ShapeCategoryName,
	SHAPES_CATEGORIES,
} from "Board/Items/Shape/ShapeData";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { useTranslation } from "react-i18next";

type Props = {
	onPick: (
		type: ShapeType,
		category?: ShapeCategoryName,
		e?: MouseEvent,
	) => void;
	selected?: ShapeType | "None";
	categoryName: ShapeCategoryName;
	buttonSize?: "lg" | "md" | "sm";
};

export function ShapePicker({
	onPick,
	selected,
	categoryName,
	buttonSize = "md",
}: Props): React.ReactElement {
	const [toolTipStyle, setToolTipStyle] = useState<CSSProperties | undefined>(
		undefined,
	);
	const refs = useRef({});
	const { t } = useTranslation();

	const shapes = SHAPES_CATEGORIES.find(
		category => category.name === categoryName,
	)!.shapes as ShapeType[];

	const getToolTipStyle = (shape: ShapeType): CSSProperties => {
		const { left, top } = refs.current[shape].getBoundingClientRect();
		return {
			left: `calc(${left + 24}px - 1rem)`,
			bottom: `calc(100% - ${top}px + 0.6rem)`,
		};
	};

	const setRef = (name: ShapeType) => (el: HTMLButtonElement) => {
		refs.current[name] = el;
	};

	return (
		<>
			{shapes.map((shape: ShapeType) => (
				<UiButton
					ref={setRef(shape)}
					tooltipPosition={"top-right-fixed"}
					tooltip={
						categoryName !== "basicShapes"
							? t(`shapePicker.${categoryName}.${shape}`)
							: undefined
					}
					id={`shape-${shape}`}
					onClick={e => onPick(shape, categoryName, e)}
					key={shape}
					size={buttonSize}
					variant="secondary"
					active={selected === shape}
					onMouseEnter={() => setToolTipStyle(getToolTipStyle(shape))}
					toolTipStyle={toolTipStyle}
				>
					<ShapeIcon
						style={{ objectFit: "cover" }}
						iconName={shape}
						width={20}
						height={20}
					/>
				</UiButton>
			))}
		</>
	);
}
