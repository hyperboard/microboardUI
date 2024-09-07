import React, {
	forwardRef,
	MouseEventHandler,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import style from "./Selector.module.css";
import { useClickOutside } from "lib/useClickOutside";
import { Icon } from "View/Icon";

interface SelectorProps {
	label: string;
	options: { value: string; label: React.ReactNode }[];
}

export interface SelectorHandle {
	getSelectedOption: () => { value: string; label: React.ReactNode };
	setSelectedOption: (option: {
		value: string;
		label: React.ReactNode;
	}) => void;
}

const Selector = forwardRef<SelectorHandle, SelectorProps>(
	({ label, options }, ref) => {
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
				<label className={style.label}>{label}</label>
				<br />
				<span
					ref={selectorOpenerRef}
					className={style.selector}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className={style.selectorText}>
						{selectedOption.label}
					</span>
					<span className={style.arrow}></span>
				</span>
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
