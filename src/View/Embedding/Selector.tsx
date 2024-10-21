import { useClickOutside } from "lib/useClickOutside";
import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Icon } from "View/Icon";
import style from "./Selector.module.css";

interface SelectorProps {
	label?: string;
	options: { value: string; label: React.ReactNode }[];
	customOpener?: React.ReactNode;
	customSelectorClassName?: string;
}

export interface SelectorHandle {
	getSelectedOption: () => { value: string; label: React.ReactNode };
	setSelectedOption: (option: {
		value: string;
		label: React.ReactNode;
	}) => void;
}

const Selector = forwardRef<SelectorHandle, SelectorProps>(
	({ label, options, customOpener, customSelectorClassName }, ref) => {
		const [selectedOption, setSelectedOption] = useState(options[0]);
		const selectorOpenerRef = useRef<HTMLSpanElement>(null);
		const dropdownRef = useClickOutside(() => {
			setIsOpen(false);
		}, [selectorOpenerRef]);
		const [isOpen, setIsOpen] = useState(false);

		useImperativeHandle(ref, () => ({
			getSelectedOption: () => selectedOption,
			setSelectedOption: (option: {
				value: string;
				label: React.ReactNode;
			}) => setSelectedOption(option),
		}));

		const handleOptionClick = (option: {
			value: string;
			label: React.ReactNode;
		}): void => {
			setSelectedOption(option);
			setIsOpen(false);
		};

		return (
			<div className={style.selectorContainer}>
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
								? selectedOption.label
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
									option.value === selectedOption.value
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
export default Selector;
