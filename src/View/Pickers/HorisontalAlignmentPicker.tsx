import { HorisontalAlignment } from "Board/Items/Alignment";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../Icon";

type Props = {
	onPick: (alignment: HorisontalAlignment) => void;
};

export function HorisontalAlignmentPicker(props: Props): React.ReactElement {
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
				id="ChangeHorisontalAlignmentLeft"
				key="ChangeHorisontalAlignmentLeft"
				title={t("contextPanel.textAlignment.left")}
				onClick={() => {
					props.onPick("left");
				}}
				onMouseEnter={event => {
					event.currentTarget.style.color = "blue";
				}}
				onMouseLeave={event => {
					event.currentTarget.style.color = "black";
				}}
				style={buttonStyle}
			>
				<Icon name={"HorisontalAlignLeft"} width={24} height={24} />
			</button>
			<button
				id="ChangeHorisontalAlignmentCenter"
				key="ChangeHorisontalAlignmentCenter"
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
				<Icon name={"HorisontalAlignCenter"} width={24} height={24} />
			</button>
			<button
				id="ChangeHorisontalAlignmentRight"
				key="ChangeHorisontalAlignmentRight"
				title={t("contextPanel.textAlignment.right")}
				onClick={() => {
					props.onPick("right");
				}}
				onMouseEnter={event => {
					event.currentTarget.style.color = "blue";
				}}
				onMouseLeave={event => {
					event.currentTarget.style.color = "black";
				}}
				style={buttonStyle}
			>
				<Icon name={"HorisontalAlignRight"} width={24} height={24} />
			</button>
		</>
	);
}
