import React, { useState } from "react";
import style from "./UiSlider.module.css";
type Props = {
	id?: string;
	min: number;
	max: number;
	step?: number;
	value?: number;
	onChange: (value: number) => void;
};

export const UiSlider: React.FC<Props> = ({
	min,
	max,
	step = 1,
	onChange,
	value,
	id,
}) => {
	const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(event.target.value, 10);
		onChange(newValue);
	};

	const calculateProgressWidth = () => {
		return ((value - min) / (max - min)) * 100 + "%";
	};

	return (
		<div className={style.container}>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={handleSliderChange}
				className={style.slider}
			/>
			<div
				style={{ width: calculateProgressWidth() }}
				className={style.progress}
			/>
		</div>
	);
};
