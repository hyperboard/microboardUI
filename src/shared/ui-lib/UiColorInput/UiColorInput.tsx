import clsx from "clsx";
import React, { ChangeEvent, useRef } from "react";
import styles from "./UiColorInput.module.css";

interface Props {
	onChange: (color: string) => void;
	color?: string;
	isActive?: boolean;
	inputClassName?: string;
	toggleMenu?: (menu: string) => void;
	setIsCloseMenu?: (isColorSelected: boolean) => void;
}

export function UiColorInput({
	onChange,
	isActive,
	color,
	inputClassName,
	toggleMenu,
	setIsCloseMenu,
}: Props): JSX.Element {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleColorChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const newColor = event.target.value;
		onChange(newColor);
	};

	const onBlur = (): void => {
		toggleMenu?.("None");
		setIsCloseMenu?.(true);
	};

	return (
		<div
			className={clsx(
				isActive && styles.active,
				styles.colorPickerContainer,
			)}
		>
			<button
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
				onBlur={onBlur}
			/>
		</div>
	);
}
