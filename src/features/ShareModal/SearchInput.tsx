import { Icon } from "shared/ui-lib/Icon";
import { TopFade } from "shared/ui-lib/Transitions/TopFade";
import React, {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ChangeEventHandler,
	type ClipboardEventHandler,
	type FocusEventHandler,
	type MouseEventHandler,
	type ReactNode,
	type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./SearchInput.module.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import isEmail from "validator/lib/isEmail";
import { validateItemsMap } from "Board/Validators";

export type SearchOption = {
	value: string;
	label: string;
	icon?: ReactNode;
};

type Props = {
	onInput: (value: string) => void;
	options: SearchOption[];
	onValuesChange: (values: string[], currValue: string) => void;
	addedEmails?: string[];
	isLoading?: boolean;
	placeholder?: string;
	excludeValues?: string[];
};

export function SearchInput({
	onInput,
	options,
	onValuesChange,
	isLoading,
	placeholder,
	excludeValues = [],
	addedEmails = [],
}: Props) {
	const { t } = useTranslation();
	const [addedValues, setAddedValues] = useState<string[]>(addedEmails);
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
	const [highlightedValueIdx, setHighlightedValueIdx] = useState<
		number | null
	>(null);

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

	useEffect(() => {
		htmlInputRef.current?.focus();
	}, []);

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
		ev.stopPropagation();
		if (isFocused) {
			return;
		}
		htmlInputRef.current?.focus();
	};

	const scrollInputToBottom = () => {
		setTimeout(() => {
			if (!inputRef.current) {
				return;
			}
			inputRef.current.scrollTo({ top: inputRef.current.scrollHeight });
		}, 0);
	};

	useLayoutEffect(() => {
		calcOptionsListPosition();
	}, [isFocused, filteredOptions.length]);

	useEffect(() => {
		options.forEach(option => {
			const value = option.value;
			const isExistsInOptions = isEmail(value.trim());
			const isValidInputValue =
				value.trim() && isExistsInOptions && highlightedIndex === null;
			if (isValidInputValue) {
				addValue(value.trim());
			}
		});

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

	const calcInputSize = (text: string) => {
		if (!htmlInputRef.current) {
			return;
		}
		htmlInputRef.current.style.height = "auto";
		htmlInputRef.current.style.height = `${htmlInputRef.current.scrollHeight}px`;
		const span = document.createElement("span");
		span.style.visibility = "hidden";
		span.style.whiteSpace = "pre";
		span.style.font = window.getComputedStyle(htmlInputRef.current).font;
		span.textContent = text || " ";
		document.body.appendChild(span);
		setInputWidth(
			span.offsetWidth >= maxWidth ? maxWidth : span.offsetWidth,
		);

		document.body.removeChild(span);
		calcOptionsListPosition();
	};

	const handleInput: ChangeEventHandler<HTMLTextAreaElement> = ev => {
		const text = ev.target.value;
		setHighlightedIndex(null);
		setCurrValue(text);
		onInput(text);
		calcInputSize(text);
	};

	const stopPropagation = (evt: SyntheticEvent) => {
		evt.stopPropagation();
	};

	const preventDefault = (evt: SyntheticEvent) => {
		evt.stopPropagation();
		evt.preventDefault();
	};

	const addValue = (currValue: string) => {
		const addedValueIdx = addedValues.findIndex(
			val => val === currValue.trim(),
		);
		const isExcludedValue = excludeValues.includes(currValue);
		if (isExcludedValue) {
			onValuesChange(addedValues, currValue);
			return;
		}

		if (addedValueIdx >= 0) {
			setHighlightedValueIdx(addedValueIdx);
			setTimeout(() => {
				setHighlightedValueIdx(null);
			}, 3000);
			return;
		}
		const values = [...addedValues, currValue];
		onValuesChange(values, currValue);
		setAddedValues(values);
		setCurrValue("");
		calcInputSize("");
		scrollInputToBottom();
	};

	const handleKeyPress = (evt: React.KeyboardEvent) => {
		evt.stopPropagation();
		switch (evt.key) {
			case "Enter":
			case " ": {
				evt.preventDefault();
				const isExistsInOptions = isEmail(currValue.trim());
				const isValidInputValue =
					currValue.trim() &&
					isExistsInOptions &&
					highlightedIndex === null;

				if (isValidInputValue) {
					addValue(currValue.trim());
				}

				if (!isExistsInOptions) {
					setCurrValue("");
					calcInputSize("");
				}

				if (highlightedIndex !== null) {
					const highlightedValue =
						filteredOptions[highlightedIndex].value;
					addValue(highlightedValue);
					setHighlightedIndex(null);
				}
				break;
			}
			case "Backspace": {
				if (!currValue) {
					setAddedValues(prev => {
						const newValues = prev.slice(0, -1);
						onValuesChange(newValues, currValue);
						return newValues;
					});
					calcInputSize("");
					scrollInputToBottom();
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

	const handlePaste: ClipboardEventHandler = evt => {
		evt.stopPropagation();
		const data = evt.clipboardData.getData("text/plain");
		try {
			const itemsObj = JSON.parse(data);
			const isDataValid = validateItemsMap(itemsObj);
			if (isDataValid) {
				evt.preventDefault();
			}
		} catch {}
	};

	const handleOptionClick =
		(opt: SearchOption): MouseEventHandler =>
		ev => {
			ev.preventDefault();
			ev.stopPropagation();
			const values = [...addedValues, opt.value.trim()];
			setAddedValues(values);
			onValuesChange(values, currValue);
			setCurrValue("");
			calcInputSize("");
			scrollInputToBottom();
		};

	const handleAddedValueClick =
		(val: string): MouseEventHandler =>
		ev => {
			ev.stopPropagation();
			ev.preventDefault();

			setAddedValues(prev => prev.filter(item => item !== val));
			onValuesChange(
				addedValues.filter(item => item !== val),
				currValue,
			);
			calcInputSize("");
			scrollInputToBottom();
		};

	return (
		<div className={styles.wrapper} onClick={stopPropagation}>
			<div className={styles.icon}>
				<Icon width={20} height={20} iconName="People" />
			</div>
			<div
				className={clsx(
					styles.inputWrapper,
					isFocused && styles.inputFocused,
				)}
			>
				<div
					ref={inputRef}
					className={styles.input}
					onClick={handleInputClick}
					onPointerDown={stopPropagation}
					onPointerUp={stopPropagation}
				>
					{addedValues.map((val, idx) => (
						<div
							className={clsx(
								styles.item,
								highlightedValueIdx === idx &&
									styles.valueHighlight,
							)}
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
						onPaste={handlePaste}
						value={currValue}
						ref={htmlInputRef}
						style={{ width: inputWidth }}
						placeholder={
							addedValues.length === 0 ? placeholder : ""
						}
					/>
				</div>
			</div>
			{/* {createPortal(
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
			)} */}
		</div>
	);
}
