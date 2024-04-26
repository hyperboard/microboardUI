import * as React from "react";
import { Icon } from "../Icon";
import { ConnectorLineStyle } from "../../Board/Items/Connector";
import { UiButton } from "View/Ui/UiButton";
import { useTranslation } from "react-i18next";

type Props = {
	onPick: (type: ConnectorLineStyle) => void;
};

type LineStyleButtonProps = {
	lineStyle: ConnectorLineStyle;
	onPick: () => void;
};

export function ConnectorLineStyleButton(
	props: LineStyleButtonProps,
): React.ReactElement {
	const buttonStyle: React.CSSProperties = {
		width: "24px",
		height: "24px",
		margin: "8px",
		padding: "0px",
		border: "none",
		cursor: "pointer",
		backgroundColor: "white",
	};
	const iconStyle: React.CSSProperties = {
		display: "block",
		overflow: "hidden",
	};
	return (
		<button
			id={`Pick${props.lineStyle}`}
			title={props.lineStyle}
			onMouseEnter={event => {
				event.currentTarget.style.color = "blue";
			}}
			onMouseLeave={event => {
				event.currentTarget.style.color = "black";
			}}
			onClick={props.onPick}
			style={buttonStyle}
		>
			<Icon
				name={props.lineStyle}
				width={24}
				height={24}
				style={iconStyle}
			/>
		</button>
	);
}

export function ConnectorLineStylePicker(props: Props): React.ReactElement {
	const { t } = useTranslation();
	return (
		<div>
			<UiButton
				id="PickStraight"
				onClick={() => {
					props.onPick("straight");
				}}
				title={t("contextPanel.connectorType.straight")}
			>
				<Icon name="straight" width={24} height={24} />
			</UiButton>
			<UiButton
				id="PickCurved"
				onClick={() => {
					props.onPick("curved");
				}}
				title={t("contextPanel.connectorType.curved")}
			>
				<Icon name="curved" width={24} height={24} />
			</UiButton>
		</div>
	);
}
