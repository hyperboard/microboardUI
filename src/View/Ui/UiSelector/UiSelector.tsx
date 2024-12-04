import { Icon } from "View/Icon";
import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import React, { useState, type MouseEventHandler, type ReactNode } from "react";
import { TopFade } from "../Transitions/TopFade";
import styles from "./UiSelector.module.css";
import { createPortal } from "react-dom";
import { UiSkeleton } from "../UiSkeleton";

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
	isLoading?: boolean;
};

export function UiSelector({
	initialValue,
	options,
	icon,
	iconColor,
	onChange,
	disabled,
	isLoading,
}: Props) {
	const [selectedOption, setSelectedOption] = useState(() =>
		initialValue
			? options.find(opt => opt.value === initialValue)
			: options[0],
	);
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const ref = useClickOutside(() => setIsOpen(false));

	const handleSelectedOptionClick: MouseEventHandler = () => {
		if (disabled || isLoading) {
			return;
		}
		setIsOpen(prev => !prev);
		if (!isOpen) {
			const rect = ref.current?.getBoundingClientRect();
			if (rect) {
				setPosition({
					top: rect.bottom + 8,
					left: rect.left,
					width: rect.width,
				});
			}
		}
	};

	const handleOptionClick =
		(option: Option): MouseEventHandler =>
		ev => {
			ev.stopPropagation();
			ev.preventDefault();
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
				(disabled || isLoading) && styles.disabled,
			)}
		>
			{isLoading ? (
				<UiSkeleton />
			) : (
				<div
					className={styles.selectedOption}
					onClick={handleSelectedOptionClick}
				>
					{selectedOption?.icon && (
						<div
							className={styles.icon}
							style={{ color: iconColor }}
						>
							{selectedOption.icon}
						</div>
					)}
					{icon && !selectedOption?.icon && (
						<div
							className={styles.icon}
							style={{ color: iconColor }}
						>
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
			)}
			{createPortal(
				<TopFade
					inProp={isOpen && !disabled && !isLoading}
					unmountOnExit
				>
					<div className={styles.optionsListWrapper} style={position}>
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
											opt.value ===
												selectedOption?.value &&
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
				</TopFade>,
				document.getElementById("selector")!,
			)}
		</div>
	);
}
