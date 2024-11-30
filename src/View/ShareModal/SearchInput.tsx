import React, {
	useEffect,
	useRef,
	useState,
	type FocusEventHandler,
	type MouseEventHandler,
	type ReactNode,
} from "react";
import styles from "./SearchInput.module.css";
import clsx from "clsx";
import { Icon } from "View/Icon";
import { TopFade } from "View/Ui/Transitions/TopFade";

const PLACEHOLDER = "Добавить пользователей";

export type SearchOption = {
	value: string;
	label: string;
	icon?: ReactNode;
};

type Props = {
	onInput: (value: string) => void;
	options: SearchOption[];
	onValueAdd: (values: string[]) => void;
};

export function SearchInput({ onInput, options, onValueAdd }: Props) {
	const [addedValues, setAddedValues] = useState<string[]>([]);
	const [currValue, setCurrValue] = useState(PLACEHOLDER);
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLParagraphElement>(null);

	const handleFocus: FocusEventHandler = () => {
		setCurrValue("");
		setIsFocused(true);
	};

	const handleBlur: FocusEventHandler = () => {
		if (addedValues.length === 0 && !currValue) {
			setCurrValue(PLACEHOLDER);
		}
		setIsFocused(false);
	};

	const handleInput = () => {
		const text = inputRef.current?.textContent || "";
		setCurrValue(text);
		onInput(text);
	};

	const handleKey = (evt: React.KeyboardEvent<HTMLDivElement>) => {
		evt.stopPropagation();
	};

	const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (evt.key === "Enter") {
			evt.preventDefault();
			if (
				currValue.trim() &&
				options.find(opt => opt.value === currValue)
			) {
				const values = [...addedValues, currValue.trim()];
				setAddedValues(values);
				setCurrValue("");
				onValueAdd(values);
			}
		} else if (evt.key === "Backspace" && !currValue) {
			setAddedValues(prev => prev.slice(0, -1));
		}
	};

	const handleOptionClick =
		(opt: SearchOption): MouseEventHandler =>
		() => {
			const values = [...addedValues, opt.value.trim()];
			setAddedValues(values);
			setCurrValue("");
			onValueAdd(values);
		};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.textContent = currValue;
		}
	}, [currValue]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.icon}>
				<Icon width={20} height={20} iconName="People" />
			</div>
			<div className={styles.input}>
				{addedValues.map(val => (
					<span className={styles.item} key={val}>
						{val}
					</span>
				))}
				<p
					ref={inputRef}
					onInput={handleInput}
					onKeyUp={handleKeyPress}
					onKeyDown={handleKey}
					onKeyPress={handleKey}
					onFocus={handleFocus}
					onBlur={handleBlur}
					contentEditable
					className={clsx(
						styles.editable,
						currValue === PLACEHOLDER && styles.placeholder,
					)}
				/>
			</div>
			<TopFade inProp={options.length > 0 && isFocused} unmountOnExit>
				<div className={styles.optionsListWrapper}>
					<ul className={styles.optionsList}>
						{options.map(opt => (
							<li
								className={styles.optionWrapper}
								key={opt.value}
							>
								<button
									onClick={handleOptionClick(opt)}
									className={styles.optionBtn}
								>
									<span className={styles.optionIcon}>
										{opt.icon}
									</span>
									<span className={styles.optionText}>
										{opt.label}
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
