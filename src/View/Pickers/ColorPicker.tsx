import * as React from "react";
import { Icon } from "../Icon";
import { UiButton } from "View/Ui/UiButton";
import { CircleIcon } from "View/Icon/CircleIcon";
import { useTranslation } from "react-i18next";

export const colors = {
	White: "rgb(255, 255, 255)",
	MustardYellow: "rgb(254, 244, 69)",
	Gold: "rgb(250, 199, 16)",
	ScarletRed: "rgb(242, 71, 38)",
	LightGray: "rgb(230, 230, 230)",
	LimeGreen: "rgb(206, 231, 65)",
	MintGreen: "rgb(143, 209, 79)",
	Magenta: "rgb(218, 0, 99)",
	DarkGray: "rgb(128, 128, 128)",
	Turquoise: "rgb(18, 205, 212)",
	ForestGreen: "rgb(12, 167, 137)",
	Violet: "rgb(149, 16, 172)",
	JetBlack: "rgb(26, 26, 26)",
	SkyBlue: "rgb(45, 155, 240)",
	RoyalBlue: "rgb(65, 75, 178)",
	Purple: "rgb(101, 44, 179)",
	BrickRed: "rgb(151, 83, 83)",
} as const;

type ColorPickerProps = {
	allowNone: boolean;
	onPick: (color: string) => void;
	list?: any;
};

export function ColorPicker({
	onPick,
	allowNone,
	list,
}: ColorPickerProps): React.ReactElement {
	const { t } = useTranslation();

	const buttons = [];
	if (allowNone) {
		buttons.push(
			<UiButton
				id={"none"}
				title={"none"}
				key={"none"}
				onClick={() => {
					onPick("none");
				}}
				margin={0}
			>
				<Icon
					name="Circle"
					fill={"white"}
					stroke={"black"}
					width={24}
					height={24}
				/>
			</UiButton>,
		);
	}
	const a = list ?? colors;
	for (const key in a) {
		const color = a[key];
		buttons.push(
			<UiButton
				id={color}
				title={t(`colors.${key}`)}
				key={color}
				onClick={() => {
					onPick(color);
				}}
				margin={0}
			>
				<div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
					<CircleIcon
						width={32}
						height={32}
						fill={color}
						stroke={"black"}
						strokeWidth={1}
					/>
				</div>
			</UiButton>,
		);
	}
	return <>{buttons}</>;
}

function onMouseEnter(event) {
	event.currentTarget.style.transform = "scale(1.2)";
}

function onMouseLeave(event) {
	event.currentTarget.style.transform = "scale(1)";
}
