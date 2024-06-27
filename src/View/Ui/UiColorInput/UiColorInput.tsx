import clsx from "clsx";
import React, { ChangeEvent, useRef } from "react";
import styles from "./UiColorInput.module.css";

interface Props {
	onChange: (color: string) => void;
	color?: string;
	isActive?: boolean;
	inputClassName?: string;
}

export function UiColorInput({
	onChange,
	isActive,
	color,
	inputClassName,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		const newColor = event.target.value;
		onChange(newColor);
	};

	return (
		<div
			className={clsx(
				isActive && styles.active,
				styles.colorPickerContainer,
			)}
		>
			<div
				className={clsx(
					styles.colorCircle,
					color === "none" && styles.image,
				)}
				style={{
					backgroundColor: color === "none" ? "transparent" : color,
				}}
				onClick={() => inputRef.current?.click()}
			/>
			<input
				className={clsx(styles.input, inputClassName)}
				ref={inputRef}
				type="color"
				value={color}
				onChange={handleColorChange}
			/>
		</div>
	);
}
