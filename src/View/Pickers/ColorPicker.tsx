import * as React from "react";
import { Icon } from "../Icon";
import { UiButton } from "View/Ui/UiButton";
import { CircleIcon } from "View/Icon/CircleIcon";
import { useTranslation } from "react-i18next";

export const colors = {
	White: "rgb(255, 255, 255)",
	"Mustard Yellow": "rgb(254, 244, 69)",
	Gold: "rgb(250, 199, 16)",
	"Scarlet Red": "rgb(242, 71, 38)",
	"Light Gray": "rgb(230, 230, 230)",
	"Lime Green": "rgb(206, 231, 65)",
	"Mint Green": "rgb(143, 209, 79)",
	Magenta: "rgb(218, 0, 99)",
	"Dark Gray": "rgb(128, 128, 128)",
	Turquoise: "rgb(18, 205, 212)",
	"Forest Green": "rgb(12, 167, 137)",
	Violet: "rgb(149, 16, 172)",
	"Jet Black": "rgb(26, 26, 26)",
	"Sky Blue": "rgb(45, 155, 240)",
	"Royal Blue": "rgb(65, 75, 178)",
	Purple: "rgb(101, 44, 179)",
	"Brick Red": "rgb(151, 83, 83)",
} as const;

type ColorPickerProps = {
	allowNone: boolean;
	onPick: (color: string) => void;
	noneTitle?: string;
	list?: any;
	id?: string;
};

export function ColorPicker({
	onPick,
	allowNone,
	noneTitle,
	list,
	id = "",
}: ColorPickerProps): React.ReactElement {
	const { t } = useTranslation();

	const buttons: React.ReactNode = [];
	if (allowNone) {
		buttons.push(
			<UiButton
				id={`${id}None`}
				title={noneTitle}
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
				id={`${id}${color}`}
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
