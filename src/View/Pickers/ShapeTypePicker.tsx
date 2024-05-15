import { ShapeType } from "Board/Items/Shape/Basic";
import * as React from "react";
import { Icon } from "../Icon";
import { UiButton } from "View/Ui/UiButton";
import { useTranslation } from "react-i18next";

const shapes = [
	"Rectangle",
	"RoundedRectangle",
	"Circle",
	"Triangle",
	"Rhombus",
	"Parallelogram",
	"Hexagon",
	"Octagon",
	"Pentagon",
	"Cross",
	"Star",
	"Cloud",
	"Cylinder",
	"Trapezoid",
	"PredefinedProcess",
	"ArrowLeft",
	"ArrowLeftRight",
	"ArrowRight",
	"SpeachBubble",
	"BracesRight",
	"BracesLeft",
] as const;

type Props = {
	onPick: (type: ShapeType) => void;
};

export function ShapePicker(props: Props): React.ReactElement {
	const { t } = useTranslation();
	const buttons: React.ReactNode = [];
	for (const shape of shapes) {
		buttons.push(
			<UiButton
				id={`PickShape${shape}`}
				title={t(`shapes.${shape}`)}
				onClick={() => {
					props.onPick(shape);
				}}
				margin={0}
				key={shape}
			>
				<Icon name={shape} width={24} height={24} />
			</UiButton>,
		);
	}
	return <>{buttons}</>;
}
