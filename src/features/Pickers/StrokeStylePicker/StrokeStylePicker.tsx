import { BorderStyle } from "Board/Items/Path";
import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import style from "./StrokeStylePicker.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
	onPick: (style: BorderStyle) => void;
	stroke?: string;
};

export function StrokeStylePicker({
	stroke,
	onPick,
}: Props): React.ReactElement {
	const handleSolidPick = (): void => {
		onPick("solid");
	};

	const handleDashPick = (): void => {
		onPick("dash");
	};

	const handleDotPick = (): void => {
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
