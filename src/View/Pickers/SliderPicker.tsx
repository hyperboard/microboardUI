import * as React from "react";
import { toFiniteNumber } from "utils";

const labelStyles = {
	fontSize: "12px",
};

const style = document.createElement("style");
style.innerHTML = `
.slider {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	width: 100px;
	height: 1px;
	border-radius: 5px;
	background-color: black;
	outline: none;
	opacity: 0.7;
	transition: opacity .2s;
	cursor: pointer;
}
  
.slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	background-color: black;
}
  
.slider::-moz-range-thumb {
	width: 15px;
	height: 15px;
	border-radius: 50%;
	background-color: black;
}
`;

document.head.appendChild(style);

type Props = {
	onPick: (width: number) => void;
	width: number;
};
export class SliderPicker extends React.PureComponent<Props> {
	handlePickWidth = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const width = toFiniteNumber(parseFloat(event.target.value), 1);
		this.props.onPick(width);
	};

	render(): React.ReactElement {
		return (
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "center",
					alignItems: "center",
					width: "100%",
				}}
			>
				<input
					type="range"
					min="1"
					max="10"
					step="0.1"
					value={this.props.width}
					className="slider"
					onInput={this.handlePickWidth}
					style={{
						width: "100%",
						marginTop: "20px",
					}}
				/>
				<p className="label" style={labelStyles}>
					Thickness
				</p>
			</div>
		);
	}
}
