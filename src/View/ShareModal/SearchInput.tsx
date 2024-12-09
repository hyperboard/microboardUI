import { Icon } from "View/Icon";
import { TopFade } from "View/Ui/Transitions/TopFade";
import React, {
	useLayoutEffect,
	useRef,
	useState,
	type ChangeEventHandler,
	type FocusEventHandler,
	type MouseEventHandler,
	type ReactNode,
	type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./SearchInput.module.css";
import clsx from "clsx";

export type SearchOption = {
	value: string;
	label: string;
	icon?: ReactNode;
};

type Props = {
	onInput: (value: string) => void;
	options: SearchOption[];
	onValueAdd: (values: string[]) => void;
	isLoading?: boolean;
};

export function SearchInput({
	onInput,
	options,
	onValueAdd,
	isLoading,
}: Props) {
	const [addedValues, setAddedValues] = useState<string[]>([]);
	const [currValue, setCurrValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLDivElement>(null);
	const htmlInputRef = useRef<HTMLInputElement>(null);
	const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
		null,
	);
	const [optionsListPosition, setOptionsListPosition] = useState<
		Record<"top" | "left" | "width", number>
	>({ left: 0, top: 0, width: 0 });

	const filteredOptions = options.filter(
		op => !addedValues.includes(op.value),
	);

	const handleFocus: FocusEventHandler = () => {
		if (isFocused) {
			return;
		}
		setIsFocused(true);
		onInput(currValue);
	};

	const handleBlur: FocusEventHandler = () => {
		setIsFocused(false);
	};

	const handleInputClick: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		if (isFocused) {
			return;
		}
		htmlInputRef.current?.focus();
	};

	useLayoutEffect(() => {
		const inputRect = inputRef.current?.getBoundingClientRect();
		if (!inputRect) {
			return;
		}
		setOptionsListPosition({
			top: inputRect.bottom + 12,
			left: inputRect.left,
			width: inputRect.width,
		});
	}, [isFocused, filteredOptions.length]);

	const handleInput: ChangeEventHandler<HTMLInputElement> = ev => {
		const text = ev.target.value;
		setHighlightedIndex(null);
		setCurrValue(text);
		onInput(text);
	};

	const stopPropagation = (evt: SyntheticEvent) => {
		evt.stopPropagation();
	};

	const preventDefault = (evt: SyntheticEvent) => {
		evt.stopPropagation();
		evt.preventDefault();
	};

	const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		switch (evt.key) {
			case "Enter": {
				if (
					currValue.trim() &&
					filteredOptions.find(opt => opt.value === currValue) &&
					highlightedIndex === null
				) {
					const values = [...addedValues, currValue.trim()];
					setAddedValues(values);
					setCurrValue("");
					onValueAdd(values);
				}

				if (highlightedIndex !== null) {
					const highlightedValue =
						filteredOptions[highlightedIndex].value;
					const values = [...addedValues, highlightedValue];
					setAddedValues(values);
					setCurrValue("");
					setHighlightedIndex(null);
					onValueAdd(values);
				}
				break;
			}
			case "Backspace": {
				if (!currValue) {
					setAddedValues(prev => prev.slice(0, -1));
				}
				break;
			}
			case "Escape": {
				evt.stopPropagation();
				if (isFocused) {
					htmlInputRef.current?.blur();
				}
				break;
			}
			case "ArrowDown": {
				setHighlightedIndex(prev => {
					if (prev === null || prev === filteredOptions.length - 1) {
						return 0;
					}
					return prev + 1;
				});
				break;
			}
			case "ArrowUp": {
				setHighlightedIndex(prev => {
					if (prev === null) {
						return filteredOptions.length - 1;
					}
					if (prev === 0) {
						return null;
					}
					return prev - 1;
				});
				break;
			}
		}
	};

	const handleOptionClick =
		(opt: SearchOption): MouseEventHandler =>
		ev => {
			ev.preventDefault();
			ev.stopPropagation();
			const values = [...addedValues, opt.value.trim()];
			setAddedValues(values);
			setCurrValue("");
			onValueAdd(values);
		};

	const handleAddedValueClick =
		(val: string): MouseEventHandler =>
		ev => {
			ev.stopPropagation();
			ev.preventDefault();

			setAddedValues(prev => prev.filter(item => item !== val));
			onValueAdd(addedValues.filter(item => item !== val));
		};

	return (
		<div className={styles.wrapper}>
			<div className={styles.icon}>
				<Icon width={20} height={20} iconName="People" />
			</div>
			<div
				ref={inputRef}
				className={clsx(styles.input, isFocused && styles.inputFocused)}
				onClick={handleInputClick}
				onPointerDown={preventDefault}
				onPointerUp={preventDefault}
			>
				{addedValues.map(val => (
					<div
						className={styles.item}
						key={val}
						onClick={handleAddedValueClick(val)}
					>
						<span>{val}</span>
						<Icon width={14} height={14} iconName="Close" />
					</div>
				))}
				<input
					className={styles.nativeInput}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onChange={handleInput}
					onKeyDown={handleKeyPress}
					onKeyUp={stopPropagation}
					onKeyPress={stopPropagation}
					value={currValue}
					ref={htmlInputRef}
					placeholder={
						addedValues.length === 0 ? "Добавьте пользователей" : ""
					}
				/>
			</div>
			{createPortal(
				<TopFade inProp={isFocused} unmountOnExit>
					<div
						onClick={preventDefault}
						style={optionsListPosition}
						className={styles.optionsListContainer}
					>
						<div className={styles.optionsListWrapper}>
							{isLoading && (
								<p className={styles.notFound}>Loading...</p>
							)}
							{!isLoading &&
								(filteredOptions.length > 0 ? (
									<ul className={styles.optionsList}>
										{filteredOptions.map((opt, idx) => (
											<li
												className={styles.optionWrapper}
												key={opt.value}
											>
												<button
													onClick={handleOptionClick(
														opt,
													)}
													className={clsx(
														styles.optionBtn,
														idx ===
															highlightedIndex &&
															styles.highlighted,
													)}
												>
													<span
														className={
															styles.optionIcon
														}
													>
														{opt.icon}
													</span>
													<span
														className={
															styles.optionText
														}
													>
														{opt.label}
													</span>
												</button>
											</li>
										))}
									</ul>
								) : (
									<p className={styles.notFound}>
										Нет подходящих результатов
									</p>
								))}
						</div>
					</div>
				</TopFade>,
				document.getElementById("selector")!,
			)}
		</div>
	);
}
