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
import styles from "./SearchInput.module.css";
import clsx from "clsx";
import { Icon } from "View/Icon";
import { TopFade } from "View/Ui/Transitions/TopFade";
import { createPortal } from "react-dom";

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
	const [optionsListPosition, setOptionsListPosition] = useState<
		Record<"top" | "left" | "width", number>
	>({ left: 0, top: 0, width: 0 });

	const filteredOptions = options.filter(
		op => !addedValues.includes(op.value),
	);

	const handleFocus: FocusEventHandler = () => {
		setIsFocused(true);
		onInput(currValue);
	};

	const handleBlur: FocusEventHandler = () => {
		setIsFocused(false);
	};

	const handleInputClick: MouseEventHandler = () =>
		htmlInputRef.current?.focus();

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
		setCurrValue(text);
		onInput(text);
	};

	const stopPropagation = (evt: SyntheticEvent) => {
		evt.stopPropagation();
	};

	const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (evt.key === "Enter") {
			evt.preventDefault();
			if (
				currValue.trim() &&
				filteredOptions.find(opt => opt.value === currValue)
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
				className={styles.input}
				onClick={handleInputClick}
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
				/>
			</div>
			{createPortal(
				<TopFade inProp={isFocused} unmountOnExit>
					<div
						style={optionsListPosition}
						className={styles.optionsListWrapper}
						onClick={stopPropagation}
					>
						{isLoading && (
							<p className={styles.notFound}>Loading...</p>
						)}
						{!isLoading &&
							(filteredOptions.length > 0 ? (
								<ul className={styles.optionsList}>
									{filteredOptions.map(opt => (
										<li
											className={styles.optionWrapper}
											key={opt.value}
										>
											<button
												onClick={handleOptionClick(opt)}
												className={styles.optionBtn}
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
				</TopFade>,
				document.getElementById("selector")!,
			)}
		</div>
	);
}
