import { UiButton } from "View/Ui/UiButton";
import { PointerIcon } from "View/Icon/PointerIcon";
import * as React from "react";
import { useTranslation } from "react-i18next";

const pointerTypes = [
	"None",
	"ArrowBroad",
	"ArrowThin",
	"TriangleFilled",
	"CircleFilled",
	"Angle",
	"TriangleEmpty",
	"DiamondFilled",
	"DiamondEmpty",
	"Zero",
	"One",
	"Many",
	"ManyMandatory",
	"OneMandatory",
	"ManyOptional",
	"OneOptional",
] as const;

type Props = {
	onPick: (pointer: string) => void;
};

export function ConnectorStartPointerPicker({
	onPick,
}: Props): React.ReactElement {
	const { t } = useTranslation();
	const buttons: React.ReactNode = [];
	for (const type of pointerTypes) {
		buttons.push(
			<UiButton
				id={`StartPointer${type}`}
				key={type}
				onClick={() => {
					onPick(type);
				}}
				title={t(`pointerTypes.${type}`)}
			>
				<PointerIcon type={type} width={24} height={24} />
			</UiButton>,
		);
	}
	return <div>{buttons}</div>;
}

export function ConnectorEndPointerPicker({
	onPick,
}: {
	onPick: (pointer: string) => void;
}): React.ReactElement {
	const { t } = useTranslation();
	const buttons: React.ReactNode = [];
	for (const pointerType of pointerTypes) {
		buttons.push(
			<UiButton
				id={`EndPointer${pointerType}`}
				key={pointerType}
				onClick={() => {
					onPick(pointerType);
				}}
				title={t(`pointerTypes.${pointerType}`)}
			>
				<PointerIcon type={pointerType} width={24} height={24} />
			</UiButton>,
		);
	}
	return <div>{buttons}</div>;
}
