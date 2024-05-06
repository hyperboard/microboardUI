import { VerticalAlignment } from "Board/Items/Alignment";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../Icon";

type Props = {
	onPick: (alignment: VerticalAlignment) => void;
};

export function VerticalAlignmentPicker(props: Props): React.ReactElement {
	const { t } = useTranslation();

	const buttonStyle: React.CSSProperties = {
		justifyContent: "center",
		alignItems: "center",
		width: "40px",
		height: "50px",
		border: "none",
		cursor: "pointer",
		backgroundColor: "white",
		float: "left",
		position: "relative",
	};
	return (
		<>
			<button
				id="ChangeVerticalAlignmentTop"
				key="ChangeVerticalAlignmentTop"
				title={t("contextPanel.textAlignment.top")}
				onClick={() => {
					props.onPick("top");
				}}
				onMouseEnter={event => {
					event.currentTarget.style.color = "blue";
				}}
				onMouseLeave={event => {
					event.currentTarget.style.color = "black";
				}}
				style={buttonStyle}
			>
				<Icon name={"VerticalAlignTop"} width={24} height={24} />
			</button>
			<button
				id="ChangeVerticalAlignmentCenter"
				key="ChangeVerticalAlignmentCenter"
				title={t("contextPanel.textAlignment.center")}
				onClick={() => {
					props.onPick("center");
				}}
				onMouseEnter={event => {
					event.currentTarget.style.color = "blue";
				}}
				onMouseLeave={event => {
					event.currentTarget.style.color = "black";
				}}
				style={buttonStyle}
			>
				<Icon name={"VerticalAlignCenter"} width={24} height={24} />
			</button>
			<button
				id="ChangeVerticalAlignmentBottom"
				key="ChangeVerticalAlignmentBottom"
				title={t("contextPanel.textAlignment.bottom")}
				onClick={() => {
					props.onPick("bottom");
				}}
				onMouseEnter={event => {
					event.currentTarget.style.color = "blue";
				}}
				onMouseLeave={event => {
					event.currentTarget.style.color = "black";
				}}
				style={buttonStyle}
			>
				<Icon name={"VerticalAlignBottom"} width={24} height={24} />
			</button>
		</>
	);
}
