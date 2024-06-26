import { BorderStyle } from "Board/Items/Path";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import React from "react";
import style from "./StrokeStylePicker.module.css";

type Props = {
	onPick: (style: BorderStyle) => void;
	stroke?: string;
};

export function StrokeStylePicker({
	stroke,
	onPick,
}: Props): React.ReactElement {
	const handleSolidPick = () => {
		onPick("solid");
	};

	const handleDashPick = () => {
		onPick("dash");
	};

	const handleDotPick = () => {
		onPick("dot");
	};

	return (
		<>
			<UiButton
				id={"stroke-solid"}
				onClick={handleSolidPick}
				active={stroke === "solid"}
				variant="secondary"
				className={style.button}
			>
				<Icon iconName="SolidLine" />
			</UiButton>
			<UiButton
				id={"stroke-dash"}
				onClick={handleDashPick}
				active={stroke === "dash"}
				variant="secondary"
				className={style.button}
			>
				<Icon iconName="DashedLine" />
			</UiButton>
			<UiButton
				id={"stroke-dot"}
				onClick={handleDotPick}
				active={stroke === "dot"}
				variant="secondary"
				className={style.button}
			>
				<Icon iconName="DottedLine" />
			</UiButton>
		</>
	);
}
