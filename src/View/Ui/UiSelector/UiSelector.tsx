import { Icon } from "View/Icon";
import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import React, { useState, type MouseEventHandler, type ReactNode } from "react";
import { TopFade } from "../Transitions/TopFade";
import styles from "./UiSelector.module.css";

export type Option = {
	label: string;
	value: string | number;
	icon?: ReactNode;
};

type Props = {
	initialValue?: string | number;
	options: Option[];
	icon?: ReactNode;
	iconColor?: string;
	onChange?: (value: string | number) => void;
	disabled?: boolean;
};

export function UiSelector({
	initialValue,
	options,
	icon,
	iconColor,
	onChange,
	disabled,
}: Props) {
	const [selectedOption, setSelectedOption] = useState(() =>
		initialValue
			? options.find(opt => opt.value === initialValue)
			: options[0],
	);
	const [isOpen, setIsOpen] = useState(false);
	const ref = useClickOutside(() => setIsOpen(false));

	const handleSelectedOptionClick: MouseEventHandler = () => {
		if (disabled) {
			return;
		}
		setIsOpen(prev => !prev);
	};

	const handleOptionClick =
		(option: Option): MouseEventHandler =>
		() => {
			if (disabled) {
				return;
			}
			setSelectedOption(option);
			setIsOpen(false);
			onChange?.(option.value);
		};

	return (
		<div
			ref={ref}
			className={clsx(
				styles.selectorWrapper,
				isOpen && styles.open,
				disabled && styles.disabled,
			)}
		>
			<div
				className={styles.selectedOption}
				onClick={handleSelectedOptionClick}
			>
				{selectedOption?.icon && (
					<div className={styles.icon} style={{ color: iconColor }}>
						{selectedOption.icon}
					</div>
				)}
				{icon && !selectedOption?.icon && (
					<div className={styles.icon} style={{ color: iconColor }}>
						{icon}
					</div>
				)}
				<p className={styles.selectedOptionText}>
					{selectedOption?.label}
				</p>
				<div className={styles.mark}>
					<Icon width={20} height={20} iconName="mark" />
				</div>
			</div>
			<TopFade inProp={isOpen} unmountOnExit>
				<div className={styles.optionsListWrapper}>
					<ul className={styles.optionsList}>
						{options.map(opt => (
							<li
								className={styles.optionWrapper}
								key={opt.value}
							>
								<button
									onClick={handleOptionClick(opt)}
									className={clsx(
										styles.optionBtn,
										opt.value === selectedOption?.value &&
											styles.selected,
									)}
								>
									<span
										style={{ color: iconColor }}
										className={styles.optionIcon}
									>
										{opt.icon}
									</span>
									<span className={styles.optionText}>
										{opt.label}
									</span>
									<span className={styles.checkMark}>
										<Icon
											width={20}
											height={20}
											iconName="checkMark"
										/>
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			</TopFade>
		</div>
	);
}
