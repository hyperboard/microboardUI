import * as React from "react";
import { toFiniteNumber } from "utils";

const labelStyles = {
	fontSize: "12px",
	color: "#333",
	alignSelf: "flex-start",
	fontWeight: 400,
	padding: 0,
	margin: 0,
};

const style = document.createElement("style");
style.innerHTML = `
.slider {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	width: 100%;
	height: 4px;
	border-radius: 10px;
	background-color: #2291FF;
	outline: none;
	transition: opacity .2s;
	cursor: pointer;
  z-index: 10;
}
  
.slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 16px;
	height: 16px;
	border-radius: 50%;
  border: 1px solid #2291FF;
	background-color: #fff;
}
  
.slider::-moz-range-thumb {
	width: 16px;
	height: 16px;
	border-radius: 50%;
  border: 1px solid #2291FF;
	background-color: #fff;
}
`;

document.head.appendChild(style);

type Props = {
	onPick: (width: number) => void;
	width: number;
	style?: React.CSSProperties;
	showLabel?: boolean;
	min?: number;
	max?: number;
	step?: number;
};

function InputDot({ offset }: { offset: number }) {
	return (
		<span
			style={{
				position: "absolute",
				width: 8,
				height: 8,
				top: 0,
				left: offset,
				content: "",
				backgroundColor: "#2291FF",
				borderRadius: "50%",
				zIndex: "0",
			}}
		/>
	);
}

// eslint-disable-next-line prefer-arrow-callback
export const SliderPicker = React.memo(function SliderPicker({
	onPick,
	width,
	style,
	showLabel = true,
	min = 2,
	max = 12,
	step = 2,
}: Props) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [inputWidth, setInputWidth] = React.useState<null | number>(null);

	const handlePickWidth = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const width = toFiniteNumber(parseFloat(event.target.value), 1);
		onPick(width);
	};

	React.useEffect(() => {
		setInputWidth(inputRef.current?.clientWidth ?? null);
	}, [inputRef]);

	const dotsOffsets: number[] = [];

	// if (inputWidth) {
	// 	dotsOffsets.push(2);
	// 	for (let i = 1; i < dots - 1; i++) {
	// 		dotsOffsets.push((Math.ceil(inputWidth / (dots - 1)) * i) - 4);
	// 	}
	// 	dotsOffsets.push(inputWidth - 6);
	// }
	const dots = Math.floor((max - min) / step);
	if (inputWidth) {
		dotsOffsets.push(2);
		for (let i = 1; i < dots; i++) {
			dotsOffsets.push((Math.ceil(inputWidth / dots) * i) - 2);
		}
		dotsOffsets.push(inputWidth - 6);
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				padding: "0 4px",
				gap: "8px",
				...style
			}}
		>
			<span style={{position: 'relative', display: 'flex', alignItems: 'center', width: '100%'}}>
			{dotsOffsets.map(offset => (
				<InputDot key={offset} offset={offset} />
			))}

			<input
				ref={inputRef}
				type="range"
				min={min}
				max={max}
				step={step}
				value={width}
				className="slider"
				onInput={handlePickWidth}
			/>
			</span>
			{showLabel && <p className="label" style={labelStyles}>
				Толщина линии
			</p>}
		</div>
	);
});
