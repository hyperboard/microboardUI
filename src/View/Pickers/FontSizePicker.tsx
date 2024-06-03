import * as React from "react";
import { useTranslation } from "react-i18next";

export const FontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288, "Auto"];

type Props = {
	onPick: (size: number) => void;
	maxSize?: number;
	inputType: "number" | "Auto";
};

export function FontSizePicker(props: Props): React.ReactElement {
	const { t } = useTranslation();
	const max = props.maxSize || 288;
	const buttonStyle: React.CSSProperties = {
		justifyContent: "center",
		alignItems: "center",
		width: "40px",
		height: "30px",
		border: "none",
		cursor: "pointer",
		backgroundColor: "white",
		float: "left",
		position: "relative",
	};

	const fontButtons: React.ReactNode = [];
	for (let i = 0; i < FontSizes.length; i++) {
		const size = FontSizes[i];
		const isDisabled = props.inputType === "Auto" ? max < +size : false;
		const additionalStyle: React.CSSProperties = {};
		if (isDisabled) {
			additionalStyle.color = "rgba(0, 0, 0, 0.4)";
			additionalStyle.cursor = "default";
		}
		fontButtons.push(
			<React.Fragment key={i}>
				<button
					id={`FontSize${size}`}
					onClick={() => {
						props.onPick(size);
					}}
					onMouseEnter={event => {
						if (isDisabled) {
							return;
						}
						event.currentTarget.style.color = "blue";
					}}
					onMouseLeave={event => {
						if (isDisabled) {
							return;
						}
						event.currentTarget.style.color = "black";
					}}
					style={{ ...buttonStyle, ...additionalStyle }}
					disabled={isDisabled}
				>
					{size === "Auto" ? t("contextPanel.fontSize.auto") : size}
				</button>
				<br></br>
			</React.Fragment>,
		);
	}
	return <>{fontButtons}</>;
}
