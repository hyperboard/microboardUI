import * as React from "react";

export const FontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

interface Props {
	onPick: (size: number) => void;
	maxSize?: number;
}

export function FontSizePicker(props: Props): React.ReactElement {
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
	const max = props.maxSize || 288
	const fontButtons = [];
	for (let i = 0; i < FontSizes.length; i++) {
		const size = FontSizes[i];
		fontButtons.push(
			<React.Fragment key={i}>
				<button
					onClick={() => {
						props.onPick(size);
					}}
					onMouseEnter={event => {
						event.currentTarget.style.color = "blue";
					}}
					onMouseLeave={event => {
						event.currentTarget.style.color = "black";
					}}
					style={buttonStyle}
					disabled={max < size}
				>
					{size}
				</button>
				<br></br>
			</React.Fragment>,
		);
	}
	return <>{fontButtons}</>;
}
