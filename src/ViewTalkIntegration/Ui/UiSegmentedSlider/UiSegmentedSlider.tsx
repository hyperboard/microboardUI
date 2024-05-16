import clsx from "clsx";
import React, { ChangeEventHandler, MouseEvent, useState } from "react";
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

	const handleDotClick =
		(value: number, index: number) => (e: MouseEvent) => {
			setSelectedValue(value);
			const nearestValue = values[index];
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
					onClick={handleDotClick(value, index)}
					key={index}
					className={clsx(
						style.dot,
						selectedValue >= value && style.active,
					)}
					style={{
						display: selectedValue === value ? "none" : "block",
						left: `calc(${
							Math.round((index / numSegments) * 10) * 10
						}% ${index === 0 ? "+ .4rem" : ""} ${
							index === values.length - 1 ? "- .4rem" : ""
						})`,
					}}
				/>
			))}
		</div>
	);
}
