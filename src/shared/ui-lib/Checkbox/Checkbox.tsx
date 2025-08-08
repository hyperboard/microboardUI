import { ReactNode, useState } from "react";
import styles from "./Checkbox.module.css";
import React from "react";
import clsx from "clsx";

type CheckboxProps = {
	checked?: boolean;
	children: ReactNode;
	onChange?: (checked: boolean) => void;
	className?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
	className,
	children,
	onChange,
	checked,
	...props
}: CheckboxProps): JSX.Element => {
	const [isChecked, setIsChecked] = useState<boolean>(checked ?? false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const isChecked = event.target.checked;
		setIsChecked(isChecked);
		onChange?.(isChecked);
	};

	return (
		<label className={clsx(styles.label, className)}>
			<input
				type="checkbox"
				onChange={handleChange}
				checked={isChecked}
				className={clsx(styles.checkbox, {
					[styles.checked]: isChecked,
				})}
				{...props}
			/>
			{children}
		</label>
	);
};
