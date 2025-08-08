import { useClickOutside } from "shared/lib/useClickOutside";
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Icon } from "shared/ui-lib/Icon";
import style from "./Selector.module.css";
import clsx from "clsx";

interface SelectorProps {
	label?: string;
	options: { value: string; label: React.ReactNode }[];
	customOpener?: React.ReactNode;
	customSelectorClassName?: string;
	containerClassName?: string;
	multiselect?: boolean;
	onChange?: () => void;
}

export interface SelectorHandle<T extends boolean> {
	getSelectedOptions: () => T extends true
		? { value: string; label: React.ReactNode }[]
		: { value: string; label: React.ReactNode };
	setSelectedOptions: (
		options: {
			value: string;
			label: React.ReactNode;
		}[],
	) => void;
}

export const Selector = forwardRef<SelectorHandle<true | false>, SelectorProps>(
	(
		{
			label,
			options,
			customOpener,
			customSelectorClassName,
			multiselect = false,
			onChange,
			containerClassName,
		},
		ref,
	) => {
		const [selectedOptions, setSelectedOptions] = useState<
			{ value: string; label: React.ReactNode }[]
		>([options[0]]);
		const selectorOpenerRef = useRef<HTMLSpanElement>(null);
		const dropdownRef = useClickOutside(() => {
			setIsOpen(false);
		}, [selectorOpenerRef]);
		const [isOpen, setIsOpen] = useState(false);

		useImperativeHandle(ref, () => ({
			getSelectedOptions: () =>
				multiselect ? selectedOptions : selectedOptions[0],
			setSelectedOptions: (
				options: {
					value: string;
					label: React.ReactNode;
				}[],
			) => setSelectedOptions(options),
		}));

		useEffect(() => {
			if (onChange) {
				onChange();
			}
		}, [selectedOptions]);

		const selectorContainerRef = useClickOutside(() => setIsOpen(false));

		const handleOptionClick = (option: {
			value: string;
			label: React.ReactNode;
		}): void => {
			if (multiselect) {
				const isSelected = selectedOptions.find(
					selOpt => selOpt.value === option.value,
				);
				if (isSelected) {
					setSelectedOptions(
						selectedOptions.filter(
							selOpt => selOpt.value !== option.value,
						),
					);
				} else {
					setSelectedOptions([...selectedOptions, option]);
				}
			} else {
				setSelectedOptions([option]);
				setIsOpen(false);
			}
		};

		return (
			<div
				ref={selectorContainerRef}
				className={clsx(style.selectorContainer, containerClassName)}
			>
				{label && (
					<>
						<label className={style.label}>{label}</label>
						<br />
					</>
				)}
				{!customOpener ? (
					<span
						ref={selectorOpenerRef}
						className={style.selector}
						onClick={() => setIsOpen(!isOpen)}
					>
						<span className={style.selectorText}>
							{!customSelectorClassName
								? selectedOptions.map((option, index) => (
										<span key={index}>
											{option.label}
											{index <
												selectedOptions.length - 1 &&
												", "}
										</span>
									))
								: customSelectorClassName}
						</span>
						<span className={style.arrow}></span>
					</span>
				) : (
					<span
						ref={selectorOpenerRef}
						className={style.selector}
						onClick={() => setIsOpen(!isOpen)}
					>
						{customOpener}
					</span>
				)}

				{isOpen && (
					<div ref={dropdownRef} className={style.dropdown}>
						{options.map(option => (
							<div
								key={option.value}
								className={`${style.option} ${
									selectedOptions.find(
										selOpt => selOpt.value === option.value,
									)
										? style.selected
										: ""
								}`}
								onClick={() => handleOptionClick(option)}
							>
								{option.label}
								<Icon
									className={style.checkmark}
									iconName="checkMark"
									width={20}
									height={20}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		);
	},
);

Selector.displayName = "Selector";
