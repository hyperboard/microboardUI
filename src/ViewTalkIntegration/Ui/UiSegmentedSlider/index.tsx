import clsx from "clsx";
import React, { ChangeEventHandler, useState } from "react";
import style from "./UiSegmentedSlider.module.css";

type Props = {
	values: number[];
	defaultValue?: number;
	onChange: (val: number) => void;
};

export function UiSegmentedSlider({ values, onChange, defaultValue }: Props) {
	const [selectedValue, setSelectedValue] = useState(
		defaultValue ?? values[0],
	);

	const handleSliderChange: ChangeEventHandler<HTMLInputElement> = e => {
		const selectedIndex = parseInt(e.target.value);
		const nearestValue = values[selectedIndex];
		setSelectedValue(nearestValue);
		onChange(nearestValue);
	};

	const numSegments = values.length - 1;

	return (
		<div className={style.container}>
			<input
				className={style.input}
				type="range"
				min={0}
				max={numSegments}
				step={1}
				value={values.indexOf(selectedValue)}
				onChange={handleSliderChange}
			/>
			<div
				className={style.progress}
				style={{
					width: `${
						(values.indexOf(selectedValue) / numSegments) * 100
					}%`,
				}}
			/>
			{values.map((value, index) => (
				<span
					key={index}
					className={clsx(
						style.dot,
						selectedValue >= value && style.active,
					)}
					style={{
						left: `calc(${(index / numSegments) * 100}% ${
							index > numSegments / 2 ? "- .4rem" : "+ .4rem"
						})`,
					}}
				/>
			))}
		</div>
	);
}
