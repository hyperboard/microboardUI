import { Icon } from "View/Icon";
import { TopFade } from "View/Ui/Transitions/TopFade";
import React, {
	useEffect,
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
import { useTranslation } from "react-i18next";

export type SearchOption = {
	value: string;
	label: string;
	icon?: ReactNode;
};

type Props = {
	onInput: (value: string) => void;
	options: SearchOption[];
	onValuesChange: (values: string[]) => void;
	isLoading?: boolean;
	placeholder?: string;
};

export function SearchInput({
	onInput,
	options,
	onValuesChange,
	isLoading,
	placeholder,
}: Props) {
	const { t } = useTranslation();
	const [addedValues, setAddedValues] = useState<string[]>([]);
	const [currValue, setCurrValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLDivElement>(null);
	const htmlInputRef = useRef<HTMLTextAreaElement>(null);
	const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
		null,
	);
	const [optionsListPosition, setOptionsListPosition] = useState<
		Record<"top" | "left" | "width", number>
	>({ left: 0, top: 0, width: 0 });
	const [inputWidth, setInputWidth] = useState(20);
	const [maxWidth, setMaxWidth] = useState<number>(0);

	const filteredOptions = options.filter(
		op => !addedValues.includes(op.value),
	);

	const calcOptionsListPosition = () => {
		const inputRect = inputRef.current?.getBoundingClientRect();
		if (!inputRect) {
			return;
		}
		setOptionsListPosition({
			top: inputRect.bottom + 12,
			left: inputRect.left,
			width: inputRect.width,
		});
	};

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
		calcOptionsListPosition();
	}, [isFocused, filteredOptions.length]);

	useEffect(() => {
		const observer = new ResizeObserver(nodes => {
			nodes.forEach(node => {
				if (node.target === inputRef.current) {
					const size = node.borderBoxSize[0];
					if (size) {
						setOptionsListPosition(prev => ({
							...prev,
							width: size.inlineSize,
						}));
					}
					const contentSize = node.contentBoxSize[0];
					if (contentSize) {
						setMaxWidth(contentSize.inlineSize);
					}
				}
			});
		});

		if (inputRef.current) {
			observer.observe(inputRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const handleInput: ChangeEventHandler<HTMLTextAreaElement> = ev => {
		const text = ev.target.value;
		setHighlightedIndex(null);
		setCurrValue(text);
		onInput(text);

		if (!htmlInputRef.current) {
			return;
		}
		htmlInputRef.current.style.height = "auto";
		htmlInputRef.current.style.height = `${htmlInputRef.current.scrollHeight}px`;

		calcOptionsListPosition();

		const span = document.createElement("span");
		span.style.visibility = "hidden";
		span.style.whiteSpace = "pre";
		span.style.font = window.getComputedStyle(htmlInputRef.current).font;
		span.textContent = text || " ";
		document.body.appendChild(span);
		console.log(maxWidth);
		setInputWidth(
			span.offsetWidth >= maxWidth ? maxWidth : span.offsetWidth,
		);

		document.body.removeChild(span);
	};

	const stopPropagation = (evt: SyntheticEvent) => {
		evt.stopPropagation();
	};

	const preventDefault = (evt: SyntheticEvent) => {
		evt.stopPropagation();
		evt.preventDefault();
	};

	const handleKeyPress = (evt: React.KeyboardEvent) => {
		evt.stopPropagation();
		switch (evt.key) {
			case "Enter": {
				evt.preventDefault();
				if (
					currValue.trim() &&
					filteredOptions.find(opt => opt.value === currValue) &&
					highlightedIndex === null
				) {
					const values = [...addedValues, currValue.trim()];
					setAddedValues(values);
					setCurrValue("");
					onValuesChange(values);
				}

				if (highlightedIndex !== null) {
					const highlightedValue =
						filteredOptions[highlightedIndex].value;
					const values = [...addedValues, highlightedValue];
					setAddedValues(values);
					setCurrValue("");
					setHighlightedIndex(null);
					onValuesChange(values);
				}
				break;
			}
			case "Backspace": {
				if (!currValue) {
					setAddedValues(prev => {
						const newValues = prev.slice(0, -1);
						onValuesChange(newValues);
						return newValues;
					});
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
			onValuesChange(values);
		};

	const handleAddedValueClick =
		(val: string): MouseEventHandler =>
		ev => {
			ev.stopPropagation();
			ev.preventDefault();

			setAddedValues(prev => prev.filter(item => item !== val));
			onValuesChange(addedValues.filter(item => item !== val));
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
				<textarea
					rows={1}
					className={styles.nativeInput}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onChange={handleInput}
					onKeyDown={handleKeyPress}
					onKeyUp={stopPropagation}
					onKeyPress={stopPropagation}
					value={currValue}
					ref={htmlInputRef}
					style={{ width: inputWidth }}
					placeholder={addedValues.length === 0 ? placeholder : ""}
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
								<p className={styles.notFound}>
									{t("common.loading")}
								</p>
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
										{t("common.notFound")}
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
