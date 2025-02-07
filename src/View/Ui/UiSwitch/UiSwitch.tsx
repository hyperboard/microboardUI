import React, {
	useLayoutEffect,
	useRef,
	useState,
	type MouseEventHandler,
	type ReactNode,
} from "react";
import style from "./UiSwitch.module.css";
import clsx from "clsx";

type Value = string | number | boolean;
type Option = {
	value: Value;
	label:
		| string
		| ((props: {
				textClass: string;
				btnClass: string;
				handleClick: MouseEventHandler;
				value: Value;
				isActive: boolean;
				activeClass: string;
		  }) => ReactNode);
};
type Props = {
	initialValue?: Value;
	options: Option[];
	onChange?: (value: Value) => void;
};

export function UiSwitch({ onChange, options, initialValue }: Props) {
	const [currValue, setCurrValue] = useState<Value>(
		initialValue ?? options[0]?.value,
	);
	const switchRef = useRef<HTMLDivElement>(null);
	const optionsRefs = useRef<(HTMLElement | null)[]>([]);

	const calcSelectorStyles = (elem: HTMLElement) => {
		const parent = elem.parentElement;
		if (parent) {
			const parentRect = parent.getBoundingClientRect();
			const btnRect = elem.getBoundingClientRect();
			const position = btnRect.left - parentRect.left;
			switchRef.current?.style.setProperty?.(
				"--width",
				`${btnRect.width}px`,
			);
			switchRef.current?.style.setProperty?.("--left", `${position}px`);
		}
	};

	useLayoutEffect(() => {
		const initialOptionIndex = options.findIndex(
			({ value }) => value === initialValue,
		);
		const selectedOptionRef =
			optionsRefs.current[
				initialOptionIndex === -1 ? 0 : initialOptionIndex
			];
		if (selectedOptionRef) {
			calcSelectorStyles(selectedOptionRef);
		}
	}, []);
	const handleOptionClick =
		(value: Value): MouseEventHandler =>
		evt => {
			evt.preventDefault();
			evt.stopPropagation();
			onChange?.(value);
			setCurrValue(value);
			calcSelectorStyles(evt.currentTarget as HTMLElement);
		};

	return (
		<div className={style.switch} ref={switchRef}>
			{options.map(({ value, label }) =>
				typeof label === "function" ? (
					label({
						textClass: style.btnText,
						btnClass: style.btn,
						handleClick: handleOptionClick(value),
						value,
						isActive: value === currValue,
						activeClass: style.active,
					})
				) : (
					<button
						key={label}
						className={clsx(
							style.btn,
							currValue === value && style.active,
						)}
						onClick={handleOptionClick(value)}
						ref={ref => optionsRefs.current.push(ref)}
					>
						<span className={style.btnText}>{label}</span>
					</button>
				),
			)}
		</div>
	);
}
